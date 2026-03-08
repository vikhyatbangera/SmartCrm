import Rule from "../models/rule.model.js";

export const createRule = async (req, res) => {
  try {
    const rule = await Rule.create(req.body);
    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRules = async (req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    res.status(200).json({
      success: true,
      message: "Rule deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};