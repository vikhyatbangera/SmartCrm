import { SlaPolicy } from "../models/slaPolicy.model.js";
import { SlaInstance } from "../models/slaInstance.model.js";


// GET ALL SLA POLICIES
export const getSlaPolicies = async (req, res) => {
  try {
    const policies = await SlaPolicy.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE SLA POLICY
export const deleteSlaPolicy = async (req, res) => {
  try {
    const policy = await SlaPolicy.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json({
      success: true,
      message: "SLA Policy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL SLA INSTANCES
export const getSlaInstances = async (req, res) => {
  try {
    const instances = await SlaInstance.find()
      .populate('policy', 'name priority slaHours')
      .sort({ startTime: -1 });
    
    res.status(200).json({
      success: true,
      data: instances,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CREATE SLA POLICY
export const createSlaPolicy = async (req, res) => {
  try {
    const policy = await SlaPolicy.create(req.body);

    res.status(201).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// START SLA (Auto Timer Start)
export const startSla = async (req, res) => {
  try {
    const { policyId, relatedTo, module } = req.body;

    const policy = await SlaPolicy.findById(policyId);

    if (!policy) {
      return res.status(404).json({ message: "SLA Policy not found" });
    }

    const startTime = new Date();
    const breachTime = new Date(
      startTime.getTime() + policy.slaHours * 60 * 60 * 1000
    );

    const instance = await SlaInstance.create({
      relatedTo,
      module,
      policy: policy._id,
      startTime,
      breachTime,
    });

    res.status(201).json({
      success: true,
      data: instance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// RESOLVE SLA
export const resolveSla = async (req, res) => {
  try {
    const sla = await SlaInstance.findById(req.params.id);

    if (!sla) {
      return res.status(404).json({ message: "SLA not found" });
    }

    sla.status = "resolved";
    await sla.save();

    res.status(200).json({
      success: true,
      message: "SLA resolved",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};