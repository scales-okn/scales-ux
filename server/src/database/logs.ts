export default (sequelize) => {
  const saveLog = (action, instance, options) => {
    try {
      const resource = instance.constructor.getTableName();
      const log = sequelize.models.Log.build({
        userId: instance?.req?.user?.id,
        resource,
        resourceId: instance.get("id"),
        actionType: action,
        timestamp: new Date(),
        previousValues: instance?._previousDataValues,
        currentValues: instance?.dataValues,
      });

      log.save();
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  };

  const logHooks = {
    afterCreate: (instance, options) => saveLog("create", instance, options),
    afterUpdate: (instance, options) => saveLog("update", instance, options),
    afterDestroy: (instance, options) => saveLog("delete", instance, options),
  };

  return {
    saveLog,
    logHooks,
  };
};
