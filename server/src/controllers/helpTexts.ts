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
    const { slug } = req.params;

    const result = await sequelize.models.HelpText.findOne({
      where: { slug },
    });

    if (result) {
      await result.destroy();

      return res.send_ok("Help Text has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete Help Text!");
  } catch (error) {
    console.warn(error);

    return res.send_internalServerError("Failed to delete Help Text!");
  }
};

// Update a HelpText
export const updateHelpText = async (req, res) => {
  try {
    const { slug } = req.params;
    const { description, examples, options, links } = req.body;

    const helpText = await sequelize.models.HelpText.findOne({
      where: { slug },
    });

    if (helpText) {
      helpText.description = description;
      helpText.examples = examples;
      helpText.options = options;
      helpText.links = links;

      await helpText.save();

      return res.send_ok("Help Text has been updated successfully!", {
        helpText,
      });
    }

    return res.send_notFound("Help Text not found.");
  } catch (error) {
    console.warn(error);

    return res.send_internalServerError(
      "An error occurred while updating Help Text."
    );
  }
};
