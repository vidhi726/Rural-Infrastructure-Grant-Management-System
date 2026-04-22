'use server'

import { connectToDatabase } from './mongodb';
import mongoose from 'mongoose';
import { Notification } from '@/models/Notification';
import { Application } from '@/models/Application';
import { Complaint } from '@/models/Complaint';
import { GrantScheme } from '@/models/GrantScheme';
import { Document as AppDocument } from '@/models/Document';
import { User } from '@/models/User';
import { State } from '@/models/State';
import { District } from '@/models/District';
import { Village } from '@/models/Village';
import { FundTransfer } from '@/models/FundTransfer';
import { Installment } from '@/models/Installment';
import { Milestone } from '@/models/Milestone';
import { AuditLog } from '@/models/AuditLog';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

function serialize(obj: any): any {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj));
}

export async function getNotifications(userId?: string) {
    await connectToDatabase();
    const query = userId ? { $or: [{ user_id: userId }, { user_id: null }] } : { user_id: null };
    const data = await Notification.find(query).sort({ createdAt: -1 }).lean();
    return serialize(data.map(d => ({ ...d, id: d._id })));
}

export async function markNotificationAsRead(id: string) {
    await connectToDatabase();
    await Notification.findByIdAndUpdate(id, { is_read: true });
}

export async function createNotification(userId: string | null, type: 'scheme' | 'application' | 'system', title: string, message: string, link?: string) {
    await connectToDatabase();
    await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        link
    });
}

export async function getPublicDashboardStats() {
    await connectToDatabase();
    const approvedCount = await Application.countDocuments({ status: { $in: ['approved', 'in_progress', 'completed'] } });
    const villagesCovered = (await Application.distinct('village_id', { status: { $ne: 'draft' } })).length;

    const apps = await Application.find({ status: { $in: ['approved', 'in_progress', 'completed'] } }).lean();
    const total_funds_allocated = apps.reduce((sum, app) => sum + (app.approved_amount || 0), 0);

    const completed_projects = await Application.countDocuments({ status: 'completed' });

    let avg_completion_percentage = 0;
    const inProgress = apps.filter(a => a.status === 'in_progress');
    if (inProgress.length > 0) {
        avg_completion_percentage = inProgress.reduce((sum, app) => sum + (app.completion_percentage || 0), 0) / inProgress.length;
    }

    const ft = await Installment.find({ status: 'utilized' }).lean();
    const total_funds_utilized = ft.reduce((sum, i) => sum + (i.amount || 0), 0);

    return serialize({
        total_approved_grants: approvedCount,
        villages_covered: villagesCovered,
        total_funds_allocated,
        total_funds_utilized,
        completed_projects,
        avg_completion_percentage
    });
}

export async function getCategoryStats() {
    await connectToDatabase();
    const schemes = await GrantScheme.find().lean();
    const apps = await Application.find({ status: { $in: ['approved', 'in_progress', 'completed'] } }).lean();

    const stats: Record<string, any> = {};
    for (const scheme of schemes) {
        if (!stats[scheme.category]) {
            stats[scheme.category] = { category: scheme.category, application_count: 0, total_amount: 0, completed_count: 0 };
        }
    }

    for (const app of apps) {
        const scheme = schemes.find(s => String(s._id) === String(app.scheme_id));
        if (scheme) {
            stats[scheme.category].application_count++;
            stats[scheme.category].total_amount += (app.approved_amount || 0);
            if (app.status === 'completed') stats[scheme.category].completed_count++;
        }
    }

    return serialize(Object.values(stats));
}

export async function getVillageGrants() {
    await connectToDatabase();
    // Simplified approximation since we don't have the view
    const apps = await Application.find({ status: { $in: ['approved', 'in_progress', 'completed'] } }).populate({ path: 'village_id', populate: { path: 'district_id' } }).lean() as any[];

    const villagesStats: Record<string, any> = {};
    for (const app of apps) {
        if (!app.village_id) continue;
        const vId = String(app.village_id._id);
        if (!villagesStats[vId]) {
            villagesStats[vId] = {
                village_id: vId,
                village_name: app.village_id.name,
                district_name: app.village_id.district_id?.name || 'Unknown',
                grant_count: 0,
                total_approved: 0,
                avg_completion: 0,
                _sum_completion: 0
            };
        }
        villagesStats[vId].grant_count++;
        villagesStats[vId].total_approved += (app.approved_amount || 0);
        villagesStats[vId]._sum_completion += (app.completion_percentage || 0);
        villagesStats[vId].avg_completion = villagesStats[vId]._sum_completion / villagesStats[vId].grant_count;
    }

    return serialize(Object.values(villagesStats).slice(0, 6));
}

export async function getFeaturedProjects() {
    await connectToDatabase();
    const apps = await Application.find({ status: { $in: ['approved', 'in_progress', 'completed'] } })
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .limit(3)
        .lean() as any[];

    return serialize(apps.map((project: any) => ({
        id: project._id,
        applicationNumber: project.application_number,
        title: project.title,
        description: project.description,
        status: project.status,
        approvedAmount: project.approved_amount || 0,
        completionPercentage: project.completion_percentage || 0,
        expectedCompletionDate: project.expected_completion_date || project.createdAt,
        category: project.scheme_id?.category || 'roads',
        village: project.village_id?.name || 'Unknown',
        district: project.village_id?.district_id?.name || 'Pune'
    })));
}

export async function getCitizenApplications(stateId?: string, villageId?: string, villageName?: string) {
    await connectToDatabase();
    const query: any = {};
    if (villageId && villageId !== 'undefined' && villageId !== '[object Object]') {
        query.village_id = villageId;
    }

    console.log('[DEBUG] getCitizenApplications query:', query);

    let apps = await Application.find(query)
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .sort({ createdAt: -1 })
        .lean() as any[];

    console.log(`[DEBUG] Found ${apps.length} total applications before state filtering`);

    if (stateId && !villageId) {
        apps = apps.filter(a => String((a.village_id as any)?.district_id?.state_id) === stateId);
    }

    return serialize(apps.map((a: any) => ({
        ...a,
        id: a._id,
        villages: { name: a.village_id?.name, districts: { name: a.village_id?.district_id?.name, state_id: a.village_id?.district_id?.state_id } },
        grant_schemes: { name: a.scheme_id?.name, category: a.scheme_id?.category }
    })));
}


export async function getCitizenComplaints(stateId?: string, userId?: string) {
    await connectToDatabase();
    console.log(`[DEBUG] getCitizenComplaints called with stateId: "${stateId}", userId: "${userId}"`);
    
    let query: any = {};
    if (userId && userId !== 'undefined') {
        query.submitted_by = userId;
    }

    let comps = await Complaint.find(query).sort({ createdAt: -1 })
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .lean() as any[];

    console.log(`[DEBUG] Found ${comps.length} complaints for query:`, query);

    if (stateId && stateId !== '' && stateId !== 'undefined') {
        const initialCount = comps.length;
        comps = comps.filter(c => {
            const compStateId = String((c.village_id as any)?.district_id?.state_id || (c.village_id as any)?.state_id || '');
            return compStateId === String(stateId);
        });
        console.log(`[DEBUG] Filtered from ${initialCount} to ${comps.length} complaints for stateId: ${stateId}`);
    }

    return serialize(comps.map((c: any) => ({
        ...c,
        id: c._id,
        villages: { name: c.village_id?.name, districts: { name: c.village_id?.district_id?.name, state_id: c.village_id?.district_id?.state_id } }
    })));
}

export async function submitComplaint(complaintData: Record<string, unknown>) {
    await connectToDatabase();
    const data = await Complaint.create(complaintData);
    
    // Notify Government Officers in the same state
    try {
        const village = await Village.findById(complaintData.village_id).populate('district_id');
        if (village && village.district_id && village.district_id.state_id) {
            const stateId = village.district_id.state_id;
            const officers = await User.find({ role: 'government_officer', state_id: stateId });
            
            for (const officer of officers) {
                await createNotification(
                    officer._id.toString(),
                    'system',
                    'New Local Complaint',
                    `A new citizen complaint has been filed in ${village.name} village.`
                );
            }
            console.log(`[Complaints] Notified ${officers.length} government officers for state ${stateId}`);
        }
    } catch (err) {
        console.error('Failed to send complaint notifications:', err);
    }

    return serialize({ ...data.toObject(), id: data._id });
}

export async function replyToComplaint(id: string, response: string) {
    await connectToDatabase();
    const updated = await Complaint.findByIdAndUpdate(id, {
        government_response: response,
        responded_at: new Date(),
        status: 'resolved'
    }, { new: true }).lean() as any;

    if (updated && updated.submitted_by) {
        await createNotification(
            updated.submitted_by.toString(),
            'system',
            'Government Responded',
            `The government has replied to your complaint: "${updated.title}"`,
            '/citizen'
        );
    }
    
    revalidatePath('/government');
    revalidatePath('/citizen');
    
    return serialize({ ...updated, id: updated._id });
}

export async function getGovernmentComplaints(stateId: string) {
    await connectToDatabase();
    console.log(`[DEBUG] getGovernmentComplaints called with stateId: "${stateId}"`);
    let comps = await Complaint.find().sort({ createdAt: -1 })
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .populate('submitted_by')
        .lean() as any[];

    if (stateId && stateId !== '') {
        const initialCount = comps.length;
        comps = comps.filter(c => {
            const compStateId = String((c.village_id as any)?.district_id?.state_id || (c.village_id as any)?.state_id || '');
            return compStateId === String(stateId);
        });
        console.log(`[DEBUG] Filtered from ${initialCount} to ${comps.length} complaints for stateId: ${stateId}`);
    }

    return serialize(comps.map((c: any) => ({
        ...c,
        id: c._id,
        villages: { name: c.village_id?.name, districts: { name: c.village_id?.district_id?.name, state_id: c.village_id?.district_id?.state_id } },
        users: { full_name: c.submitted_by?.full_name, email: c.submitted_by?.email }
    })));
}

export async function getPanchayatApplications() {
    await connectToDatabase();
    const apps = await Application.find().sort({ createdAt: -1 })
        .populate('scheme_id')
        .lean() as any[];

    return serialize(apps.map((a: any) => ({
        ...a,
        id: a._id,
        grant_schemes: { name: a.scheme_id?.name, category: a.scheme_id?.category }
    })));
}

export async function getGovernmentApplications(stateId?: string, statuses: string[] = ['submitted', 'under_review']) {
    await connectToDatabase();
    console.log(`[DEBUG] getGovernmentApplications called with stateId: "${stateId}" and statuses:`, statuses);
    
    let apps = await Application.find({ status: { $in: statuses } })
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .lean() as any[];

    if (stateId && stateId !== '') {
        const initialCount = apps.length;
        apps = apps.filter(a => {
            const appStateId = String((a.village_id as any)?.district_id?.state_id || (a.village_id as any)?.state_id || '');
            return appStateId === String(stateId);
        });
        console.log(`[DEBUG] Filtered from ${initialCount} to ${apps.length} apps for stateId: ${stateId}`);
    }

    // Documents
    for (let a of apps) {
        const docs = await AppDocument.find({ application_id: a._id }).lean();
        (a as any).documents = docs.map(d => ({ id: d._id, is_verified: d.is_verified, verified_at: d.verified_at }));
    }

    return serialize(apps.map((a: any) => ({
        ...a,
        id: a._id,
        villages: { name: a.village_id?.name, district_id: a.village_id?.district_id?._id, districts: { name: a.village_id?.district_id?.name, state_id: a.village_id?.district_id?.state_id } },
        grant_schemes: { name: a.scheme_id?.name, category: a.scheme_id?.category, required_documents: a.scheme_id?.required_documents }
    })));
}

export async function getOngoingGrantsForState(stateId: string) {
    await connectToDatabase();
    let apps = await Application.find({ status: 'in_progress' })
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .lean() as any[];

    apps = apps.filter(a => String((a.village_id as any)?.district_id?.state_id) === stateId);

    return serialize(apps.map((a: any) => ({
        id: a._id,
        application_number: a.application_number,
        title: a.title,
        status: a.status,
        approved_amount: a.approved_amount,
        completion_percentage: a.completion_percentage,
        grant_schemes: { category: a.scheme_id?.category },
        villages: {
            name: a.village_id?.name,
            districts: {
                name: a.village_id?.district_id?.name,
                state_id: a.village_id?.district_id?.state_id
            }
        }
    })));
}

export async function updateApplicationStatus(id: string, status: string, data?: any) {
    await connectToDatabase();
    const oldApp = await Application.findById(id).lean() as any;
    const updateData = { status, ...data, approved_at: status === 'approved' ? new Date() : undefined };
    const updated = await Application.findByIdAndUpdate(id, updateData, { new: true }).lean() as any;
    
    // Notification Trigger
    if (oldApp && oldApp.status !== status) {
        await createNotification(
            updated.submitted_by,
            'application',
            'Application Status Update',
            `Your application "${updated.title}" status changed to: ${status.replace('_', ' ')}`,
            '/panchayat'
        );
    }
    
    return serialize({ ...updated, id: updated?._id });
}

export async function getMilestones(applicationId: string) {
    await connectToDatabase();
    const data = await Milestone.find({ application_id: applicationId }).sort({ order_index: 1 }).lean();
    return serialize(data.map((d: any) => ({ ...d, id: d._id })));
}

export async function addMilestone(milestoneData: any) {
    await connectToDatabase();
    const data = await Milestone.create(milestoneData);
    
    // Notify if needed
    const app = await Application.findById(milestoneData.application_id);
    if (app) {
        await createNotification(
            app.submitted_by,
            'application',
            'New Milestone Added',
            `A new milestone "${milestoneData.title}" has been added to your project.`,
            '/citizen'
        );
    }
    
    return serialize({ ...data.toObject(), id: data._id });
}

export async function getAdminStats() {
    await connectToDatabase();
    const [userCount, appCount, schemeCount, villageCount] = await Promise.all([
        User.countDocuments(),
        Application.countDocuments(),
        GrantScheme.countDocuments(),
        Village.countDocuments()
    ]);

    const apps = await Application.find({ status: { $in: ['approved', 'completed'] } }).lean();
    const totalFunds = apps.reduce((sum, app) => sum + (app.approved_amount || 0), 0);

    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const roleStats: Record<string, number> = {};
    usersByRole.forEach(r => {
        roleStats[r._id] = r.count;
    });

    return serialize({
        userStats: {
            total: userCount,
            ...roleStats
        },
        systemStats: {
            totalGrants: appCount,
            totalFunds,
            activeSchemes: schemeCount,
            villages: villageCount
        }
    });
}

export async function getAuditLogs() {
    await connectToDatabase();
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('user_id').lean();
    return serialize(logs.map((l: any) => ({
        ...l,
        id: l._id,
        user: l.user_id?.full_name || 'System',
        timestamp: l.createdAt
    })));
}

export async function getAllUsers() {
    await connectToDatabase();
    const users = await User.find()
        .populate('village_id')
        .sort({ createdAt: -1 })
        .lean() as any[];

    return serialize(users.map(u => ({
        ...u,
        id: u._id,
        village: u.village_id?.name || null
    })));
}

export async function getApplicationDocuments(applicationId: string) {
    await connectToDatabase();
    const docs = await AppDocument.find({ application_id: applicationId }).lean();
    return serialize(docs.map((d: any) => ({ ...d, id: d._id })));
}

export async function getProjectDetails(id: string) {
    await connectToDatabase();
    const app = await Application.findById(id)
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .lean() as any;

    if (!app) return null;

    return serialize({
        ...app,
        id: app._id,
        village: app.village_id?.name || 'Unknown',
        district: app.village_id?.district_id?.name || 'Unknown',
        scheme: app.scheme_id?.name || 'Unknown',
        category: app.scheme_id?.category || 'roads',
        villages: { name: app.village_id?.name, districts: { name: app.village_id?.district_id?.name } },
        grant_schemes: { name: app.scheme_id?.name, category: app.scheme_id?.category }
    });
}

export async function getGrantSchemes(onlyActive: boolean = true) {
    await connectToDatabase();
    const query = onlyActive ? { is_active: true } : {};
    const schemes = await GrantScheme.find(query).lean();
    return serialize(schemes.map((s: any) => ({ ...s, id: s._id })));
}

export async function getGrantSchemeById(id: string) {
    await connectToDatabase();
    const scheme = await GrantScheme.findById(id).lean();
    if (!scheme) return null;
    return serialize({ ...scheme, id: scheme._id });
}

export async function createGrantScheme(schemeData: any) {
    await connectToDatabase();
    const data = await GrantScheme.create(schemeData);
    return serialize({ ...data.toObject(), id: data._id });
}

export async function submitApplication(applicationData: any) {
    await connectToDatabase();
    const data = await Application.create(applicationData);
    return serialize({ ...data.toObject(), id: data._id });
}

export async function getStates() {
    await connectToDatabase();
    const states = await State.find().sort({ name: 1 }).lean();
    return serialize(states.map((s: any) => ({ ...s, id: s._id })));
}

export async function getDistricts(stateId: string) {
    await connectToDatabase();
    const dists = await District.find({ state_id: stateId }).sort({ name: 1 }).lean();
    return serialize(dists.map((d: any) => ({ ...d, id: d._id })));
}

export async function getVillages(districtId: string) {
    await connectToDatabase();
    const vils = await Village.find({ district_id: districtId }).sort({ name: 1 }).lean();
    return serialize(vils.map((v: any) => ({ ...v, id: v._id })));
}

export async function uploadDocument(formData: FormData) {
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;

    if (!userId) {
        console.error('uploadDocument: userId is missing');
        throw new Error('User ID is required for document upload. Please ensure you are logged in.');
    }
    await connectToDatabase();
    // Simulate upload - we write to local public dir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', applicationId);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    const publicUrl = `/uploads/${applicationId}/${fileName}`;

    const data = await AppDocument.create({
        application_id: applicationId,
        document_type: type,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: userId
    });

    return serialize({ ...data.toObject(), id: data._id });
}

export async function verifyDocument(documentId: string, isVerified: boolean, userId: string, rejectionReason?: string) {
    await connectToDatabase();
    const update = { is_verified: isVerified, verified_by: userId, verified_at: new Date(), rejection_reason: rejectionReason };
    const data = await AppDocument.findByIdAndUpdate(documentId, update, { new: true }).lean();
    return serialize({ ...data, id: data?._id });
}

export async function getUserProfile(userId: string) {
    await connectToDatabase();
    const user = await User.findById(userId)
        .populate('village_id')
        .populate('district_id')
        .populate('state_id')
        .lean() as any;

    if (!user) return null;

    return serialize({
        ...user,
        id: user._id,
        village: user.village_id ? { id: user.village_id._id, name: user.village_id.name } : null,
        district: user.district_id ? { id: user.district_id._id, name: user.district_id.name } : null,
        state: user.state_id ? { id: user.state_id._id, name: user.state_id.name } : null,
        // Backward compatibility
        villages: user.village_id ? { name: user.village_id.name } : null,
        districts: user.district_id ? { name: user.district_id.name } : null,
        states: user.state_id ? { name: user.state_id.name } : null,
    });
}

export async function getVillagesProgress(stateId?: string, districtId?: string) {
    await connectToDatabase();
    
    // Determine query for villages
    let villageQuery: any = {};
    if (districtId) {
        villageQuery.district_id = districtId;
    }

    const allVillages = await Village.find(villageQuery).populate('district_id').lean() as any[];

    // If a stateId is provided but no districtId, we need to filter villages by stateId.
    let filteredVillages = allVillages;
    if (stateId && !districtId) {
        filteredVillages = allVillages.filter(v => String(v.district_id?.state_id) === stateId);
    }

    // Now get all applications for these villages
    const villageIds = filteredVillages.map(v => v._id);
    const apps = await Application.find({ 
        village_id: { $in: villageIds },
        status: { $in: ['approved', 'in_progress', 'completed', 'submitted', 'under_review'] }
    }).populate('scheme_id').lean() as any[];

    const villagesStats: Record<string, any> = {};
    
    // Initialize stats for all fetched villages
    for (const v of filteredVillages) {
        villagesStats[String(v._id)] = {
            id: String(v._id),
            name: v.name,
            district: v.district_id?.name || 'Unknown',
            grants: [],
            grant_count: 0,
            total_approved: 0,
            avg_completion: 0,
            _sum_completion: 0
        };
    }

    // Process applications
    for (const app of apps) {
        if (!app.village_id) continue;
        const vId = String(app.village_id);
        if (!villagesStats[vId]) continue;

        villagesStats[vId].grant_count++;
        villagesStats[vId].total_approved += (app.approved_amount || 0);
        villagesStats[vId]._sum_completion += (app.completion_percentage || 0);
        villagesStats[vId].avg_completion = villagesStats[vId].grant_count > 0 
            ? villagesStats[vId]._sum_completion / villagesStats[vId].grant_count 
            : 0;
            
        villagesStats[vId].grants.push({
            title: app.title,
            category: app.scheme_id?.category || 'General',
            status: app.status,
            progress: app.completion_percentage || 0
        });
    }

    return serialize(Object.values(villagesStats));
}

export async function getAdminApprovedApplications() {
    await connectToDatabase();
    
    console.log("[DEBUG] Fetching strictly 'approved' applications for Admin Dashboard...");
    const apps = await Application.find({ status: 'approved' })
        .populate('scheme_id')
        .populate({ path: 'village_id', populate: { path: 'district_id' } })
        .sort({ approved_at: -1 })
        .lean() as any[];
        
    console.log(`[DEBUG] Successfully retrieved ${apps.length} approved applications for Admin.`);

    return serialize(apps.map((a: any) => ({
        id: a._id,
        applicationNumber: a.application_number,
        title: a.title,
        status: a.status,
        requestedAmount: a.requested_amount,
        approvedAmount: a.approved_amount || 0,
        totalReleasedAmount: a.totalReleasedAmount || 0,
        installments: a.installments || [],
        village: a.village_id?.name || 'Unknown',
        district: a.village_id?.district_id?.name || 'Unknown',
        scheme: a.scheme_id?.name || 'Unknown',
        category: a.scheme_id?.category || 'roads',
    })));
}

export async function releaseFundInstallment(applicationId: string, amount: number, remarks: string, releasedBy: string) {
    await connectToDatabase();
    const app = await Application.findById(applicationId);
    if (!app) throw new Error('Application not found');

    const totalReleased = (app.totalReleasedAmount || 0) + amount;
    const approvedAmount = app.approved_amount || 0;

    if (totalReleased > approvedAmount) {
        throw new Error(`Cannot release amount. Request exceeds approved amount. Remaining: ₹${approvedAmount - (app.totalReleasedAmount || 0)}`);
    }

    const nextInstallmentNumber = (app.installments?.length || 0) + 1;
    const newInstallment = {
        installmentNumber: nextInstallmentNumber,
        amount,
        remarks,
        releaseDate: new Date(),
        status: 'Released'
    };

    if (!app.installments) {
        app.installments = [];
    }
    app.installments.push(newInstallment);
    app.totalReleasedAmount = totalReleased;
    await app.save();

    // Create Notification for the Panchayat Officer
    if (app.submitted_by) {
        await createNotification(
            app.submitted_by.toString(),
            'application',
            'Funds Released',
            `₹${amount.toLocaleString('en-IN')} installment released for [${app.title}].`,
            '/panchayat'
        );
        // Simulated SMS notification
        console.log(`[SMS MOCK] To UserID: ${app.submitted_by} - ₹${amount.toLocaleString('en-IN')} installment released for [${app.title}]`);
    }

    revalidatePath('/panchayat');
    revalidatePath('/government');
    revalidatePath('/admin');

    return serialize({ success: true, newInstallment, totalReleasedAmount: totalReleased });
}
