import { sequelize } from "../database";

// Create HelpText
export const create = async (req, res) => {
  try {
    const { description, examples, options, links, slug } = req.body;

    const helpText = await sequelize.models.HelpText.create({
      slug,
      description,
      examples,
      options,
      links,
    });

    return res.send_ok("Help Text Created!", { helpText });
  } catch (error) {
    console.warn(error);

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find all HelpText
export const findAll = async (req, res) => {
  try {
    const helpTexts = await sequelize.models.HelpText.findAll({
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { helpTexts });
  } catch (error) {
    console.warn(error);

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Delete a HelpText
export const deleteHelpText = async (req, res) => {
  try {
    const { helpTextId } = req.params;

    const result = await sequelize.models.HelpText.findByIdAndDelete(
      helpTextId
    );
    if (result) {
      return res.send_ok("Help Text has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete Help Text!");
  } catch (error) {
    console.warn(error);

    return res.send_internalServerError("Failed to delete Help Text!");
  }
};
