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
      dataSourceDiff: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ontologyDiff: {
        type: DataTypes.STRING,
        allowNull: true,
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

export const createRingDiff = async ({ lastVersion, newVersion }) => {
  const newDataSource = JSON.stringify(newVersion.dataSource);
  const newOntology = JSON.stringify(newVersion.ontology);
  const oldDataSource = JSON.stringify(lastVersion.dataSource);
  const oldOntology = JSON.stringify(lastVersion.ontology);
  const dataSourceDifferences = jsonDiff.diffString(JSON.parse(oldDataSource), JSON.parse(newDataSource));
  const ontologyDifferences = jsonDiff.diffString(JSON.parse(oldOntology), JSON.parse(newOntology));
  const convert = new Convert();
  const dataSourceDiffHtml = convert.toHtml(dataSourceDifferences);
  const ontologyDiffHtml = convert.toHtml(ontologyDifferences);

  const updatedVersion = await newVersion.update({
    dataSourceDiff: dataSourceDiffHtml,
    ontologyDiff: ontologyDiffHtml,
  });

  return updatedVersion;
};

export const notifyAdminsOfRingChange = async ({ ringVersion }) => {
  const admins = await sequelize.models.User.findAll({
    where: { role: "admin" },
  });

  const ringLabel = `${ringVersion.name} (RID: ${ringVersion.rid})`;

  admins.forEach((a) => {
    if (a.notifyOnNewRingVersion === false) return;

    sendEmail({
      emailSubject: `Ring Updated: (${ringLabel})`,
      recipientEmail: a.email,
      templateName: "ringUpdated",
      recipientName: `${a.firstName} ${a.lastName}`,
      templateArgs: {
        saturnUrl: process.env.UX_CLIENT_MAILER_URL,
        sesSender: process.env.SES_SENDER,
        dataSource: ringVersion.dataSource,
        ontology: ringVersion.ontology,
        ringLabel,
        dataSourceDifferences: ringVersion.dataSourceDiff,
        ontologyDifferences: ringVersion.ontologyDiff,
      },
    });
  });
};
