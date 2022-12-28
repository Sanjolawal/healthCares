//importing appointments collection
const { find } = require("../schemas/scheduleSchema");
const schedule = require(`../schemas/scheduleSchema`);
// importing dependencies

// api for creating schedule
const createSchedule = async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const idNumber = Number(userId.split(`-`)[1]);
    const doc = await schedule.find({});
    if (doc.length === 0) {
      const document = await schedule.create({
        ...req.body,
        scheduleId: `SCH-${1}`,
        sid: 1,
        isActive: true,
        dateCreated: Date(),
        dateCreatedMilliSeconds: new Date().valueOf(),
      });

      const test = await schedule
        .aggregate([
          {
            $match: { _id: document._id },
          },
          {
            $lookup: {
              from: `medicalcenters`,
              localField: `medicalCenterId`,
              foreignField: `medicalCenterId`,
              as: `medicalcenter`,
            },
          },
          {
            $lookup: {
              from: `doctors`,
              localField: `doctorId`,
              foreignField: `doctorId`,
              as: `doctor`,
            },
          },
        ])
        .exec();
      if (test[0].doctor.length === 0 || test[0].medicalcenter.length === 0) {
        const deleteDocument = await schedule.findByIdAndDelete(document._id);
        return res.status(404).json({
          msg: `schedule cannot be created, invalid doctor or medicalcenter id inputted`,
        });
      }
      test.forEach((each) => {
        delete each._id;
      });
      const newDoc = await schedule.findOneAndReplace(
        { _id: document._id },
        test[0],
        {
          new: true,
        }
      );

      res.status(200).json(newDoc);
    } else {
      let lastDoc = doc[doc.length - 1];
      const changedId = Number(lastDoc.scheduleId.split(`-`)[1]);
      const document = await schedule.create({
        ...req.body,
        scheduleId: `SCH-${changedId + 1}`,
        sid: changedId + 1,
        isActive: true,
        dateCreated: Date(),
        dateCreatedMilliSeconds: new Date().valueOf(),
      });

      const test = await schedule
        .aggregate([
          {
            $match: { _id: document._id },
          },
          {
            $lookup: {
              from: `medicalcenters`,
              localField: `medicalCenterId`,
              foreignField: `medicalCenterId`,
              as: `medicalcenter`,
            },
          },
          {
            $lookup: {
              from: `doctors`,
              localField: `doctorId`,
              foreignField: `doctorId`,
              as: `doctor`,
            },
          },
        ])
        .exec();
      if (test[0].doctor.length === 0 || test[0].medicalcenter.length === 0) {
        const deleteDocument = await schedule.findByIdAndDelete(document._id);
        return res.status(404).json({
          msg: `schedule cannot be created, invalid doctor or medicalcenter id inputted`,
        });
      }
      test.forEach((each) => {
        delete each._id;
      });
      const newDoc = await schedule.findOneAndReplace(
        { _id: document._id },
        test[0],
        {
          new: true,
        }
      );

      res.status(200).json(newDoc);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for updating schedule
const updateSchedule = async (req, res) => {
  try {
    const document = await schedule
      .findOneAndUpdate(
        req.params,
        {
          ...req.body,
          lastUpdateDate: Date(),
        },
        { new: true }
      )
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const specificSchedule = async (req, res) => {
  try {
    const document = await schedule.findOne(req.params).lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// getting all schedules
const allSchedule = async (req, res) => {
  try {
    const city = req.query.city;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const doctorId = req.query.doctorId;
    const medicalCenterIdQuery = req.query.medicalCenterId;
    const sortBy = req.query.sortBy;
    const specialtyQuery = req.query.specialty;
    const starting_after_object = req.query.starting_after_object;
    const timeslot = req.query.timeslot;
    let limit = req.query.limit;
    if (limit) {
      limit = Number(limit);
      if (limit > 100 || limit < 1) {
        limit = 30;
      }
    }
    const queriedDocument = await schedule.find({
      $or: [
        {
          aid: {
            $gt: starting_after_object
              ? Number(starting_after_object.split(`-`)[1])
              : starting_after_object,
          },
        },
        {
          dateCreatedMilliSeconds: {
            $lte: toDate ? new Date(toDate).valueOf() : toDate,
          },
        },
        {
          dateCreatedMilliSeconds: {
            $gte: fromDate ? new Date(fromDate).valueOf() : fromDate,
          },
        },
        {
          "medicalcenter.medicalCenterId": medicalCenterIdQuery,
        },
        {
          timeslot: timeslot,
        },
        {
          "medicalcenter.city": city,
        },
        {
          "doctor.specialty": specialtyQuery,
        },
        {
          "doctor.doctorId": doctorId,
        },
      ],
    });
    if (queriedDocument.length === 0) {
      const documents = await schedule.find({});
      const document = await schedule.find({}).limit(limit ? limit : 30);
      if (document.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        document,
        objectCount: documents.length,
        hasMore: documents.length > document.length ? true : false,
      });
    }
    const queriedDocuments = await schedule
      .find({
        $or: [
          {
            aid: {
              $gt: starting_after_object
                ? Number(starting_after_object.split(`-`)[1])
                : starting_after_object,
            },
          },
          {
            dateCreatedMilliSeconds: {
              $lte: toDate ? new Date(toDate).valueOf() : toDate,
            },
          },
          {
            dateCreatedMilliSeconds: {
              $gte: fromDate ? new Date(fromDate).valueOf() : fromDate,
            },
          },
          {
            "medicalcenter.medicalCenterId": medicalCenterIdQuery,
          },
          {
            timeslot: timeslot,
          },
          {
            "medicalcenter.city": city,
          },
          {
            "doctor.specialty": specialtyQuery,
          },
          {
            "doctor.doctorId": doctorId,
          },
        ],
      })
      .limit(limit ? limit : 30);
    if (queriedDocuments.length === 0) {
      return res.status(404).json({ msg: `appointments not found` });
    }
    return res.status(200).json({
      queriedDocuments,
      objectCount: queriedDocument.length,
      hasMore: queriedDocument.length > queriedDocuments.length ? true : false,
    });
  } catch (error) {
    console.log(error);
    if (error.path) {
      return res.status(404).json({
        msg: `${error.path} field as ${error.kind} casting failed, check ${error.path} input or value again`,
      });
    }
    res.status(500).json({ msg: error.message });
  }
};

// deleting schedule
const deleteSchedule = async (req, res) => {
  try {
    const document = await schedule.findOneAndDelete(req.params).lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json({ msg: `successfully deleted` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createSchedule,
  updateSchedule,
  specificSchedule,
  allSchedule,
  deleteSchedule,
};
