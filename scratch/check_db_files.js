const mongoose = require('mongoose');

async function checkFiles() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/grant_management');
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ full_name: String, role: String }));
        const Document = mongoose.model('Document', new mongoose.Schema({ uploaded_by: mongoose.Schema.Types.ObjectId, file_name: String, uploader_role: String }));

        const user = await User.findOne({ email: 'panchayat@gmail.com' }); // or the one gujaratpanchayat uses
        // Wait, let's just list all users to see
        const users = await User.find();
        console.log('Users:', users.map(u => ({ id: u._id, name: u.full_name, role: u.role, email: u.email })));

        const docs = await Document.find().populate('uploaded_by');
        console.log('Documents:', docs.map(d => ({
            id: d._id,
            name: d.file_name,
            uploaded_by: d.uploaded_by?._id,
            uploader_name: d.uploaded_by?.full_name,
            role: d.uploader_role
        })));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkFiles();
