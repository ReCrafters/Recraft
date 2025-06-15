const mongoose = require('mongoose');
const BaseUser = require('./baseUser'); 

const AdminSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },

  designation: {
    type: String, //Have to create enum for this
    required: true
  },

  permissions: [{
    type: String //Have to create enum for this
  }],

  verificationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Verification"
  }],

  handledReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report"
  }],

  auditReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuditReport"
  }]
});

const AdminModel = BaseUser.discriminator("admin", AdminSchema);

module.exports = AdminModel;
