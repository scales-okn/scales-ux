import { DataTypes } from "sequelize";
import jsonDiff from "json-diff";
import Convert from "ansi-to-html";
import { sendEmail } from "../services/sesMailer";
import { sequelize } from "../database";

export const ringVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Ring = sequelize.define(
    "Ring",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      version: {
        type: DataTypes.INTEGER,
        noUpdate: true,
        defaultValue: 1,
      },
      schemaVersion: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dataSource: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      ontology: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM,
        values: ringVisibilityValues,
        defaultValue: "private",
      },
    },
    options
  );

  Ring.associate = (models) => {
    Ring.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Ring;
};

export const notifyAdminsOfRingChange = async ({ ring, updatedRing, oldDataSource, oldOntology }) => {
  const admins = await sequelize.models.User.findAll({
    where: { role: "admin" },
  });

  const ringLabel = `${ring.name} (RID: ${ring.rid})`;

  const newDataSource = JSON.stringify(updatedRing.dataSource);
  const newOntology = JSON.stringify(updatedRing.ontology);
  const dataSourceDifferences = jsonDiff.diffString(JSON.parse(oldDataSource), JSON.parse(newDataSource));
  const ontologyDifferences = jsonDiff.diffString(JSON.parse(oldOntology), JSON.parse(newOntology));

  const convert = new Convert();
  admins.forEach((a) => {
    sendEmail({
      emailSubject: `Ring Updated (${ringLabel})`,
      recipientEmail: a.email,
      templateName: "ringUpdated",
      recipientName: `${a.firstName} ${a.lastName}`,
      templateArgs: {
        saturnUrl: process.env.UX_CLIENT_MAILER_URL,
        sesSender: process.env.SES_SENDER,
        dataSource: JSON.stringify(updatedRing.dataSource),
        ontology: JSON.stringify(updatedRing.ontology),
        ringLabel,
        dataSourceDifferences: convert.toHtml(dataSourceDifferences),
        ontologyDifferences: convert.toHtml(ontologyDifferences),
      },
    });
  });
};
