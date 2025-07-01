const Report= require('../models/report');
module.exports.newReport=  async (req, res) => {
  try {
    const { reportedEntity, reason, detail } = req.body;
    const report = new Report({
      reportedBy: req.user._id,
      reportedEntity,
      reason,
      detail,
      status: 'pending'
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error});
  }
}
module.exports.getReport= async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reports = await Report.find(filter)
      .populate('reportedBy', 'username email')
      .populate('reportedEntity')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports.updateReport= async (req, res) => {
  try {
    if (!req.user.role==='admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { status, actionTaken, adminComment } = req.body;
    const update = { 
      status,
      handledBy: req.user._id,
      handledAt: Date.now()
    };
    if (actionTaken) update.actionTaken = actionTaken;
    if (adminComment) update.adminComment = adminComment;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}