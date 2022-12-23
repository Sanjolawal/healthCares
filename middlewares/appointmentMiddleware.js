//importing appointments collection
const { find } = require("../schemas/appointmentSchema");
const appointment = require(`../schemas/appointmentSchema`);
// importing dependencies

// api for creating appointment
const createAppointment = async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const idNumber = Number(userId.split(`-`)[1]);
    const doc = await appointment.find({});
    // const appointmentDoc = await appointment.find(req.params);
    if (req.params.userId !== userId) {
      return res.status(404).json({ msg: `appointments not found` });
    }
    if (doc.length === 0) {
      const document = await appointment.create({
        ...req.body,
        userId: req.params.userId,
        timeslot: `pending`,
        price: `pending`,
        appointmentStatus: `pending`,
        appointmentId: `AP-${1}`,
        aid: 1,
      });
      const test = await appointment
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
      const newDoc = await appointment.findOneAndReplace(
        { _id: document._id },
        test[0]
      );
      console.log(newDoc);
      res.status(200).json(test[0]);
    } else {
      const lastappointmentDoc = doc[doc.length - 1];
      const idNumber = Number(lastappointmentDoc.appointmentId.split(`-`)[1]);
      const document = await appointment.create({
        ...req.body,
        userId: req.params.userId,
        timeslot: `pending`,
        price: `pending`,
        appointmentStatus: `pending`,
        appointmentId: `AP-${idNumber + 1}`,
        aid: idNumber + 1,
      });
      const test = await appointment
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
      const newDoc = await appointment.findOneAndReplace(
        { _id: document._id },
        test[0]
      );
      res.status(200).json(test[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for updating appointment
const updateAppointment = async (req, res) => {
  try {
    const document = await appointment
      .findOneAndUpdate(
        {
          appointmentId: req.params.appointmentId,
          userId: res.locals.user.userId,
        },
        req.body,
        {
          new: true,
        }
      )
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }

    const response = await appointment
      .aggregate([
        {
          $match: {
            appointmentId: req.params.appointmentId,
            userId: document.userId,
          },
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
    response.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(response[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const specificAppointment = async (req, res) => {
  try {
    const booked = req.query.booked;
    const cancelled = req.query.cancelled;
    const rejected = req.query.rejected;
    const completed = req.query.completed;
    const pending = req.query.pending;
    const limitQuery = req.query.limit;
    const limit = Number(limitQuery);
    if (pending) {
      const document = await appointment.find({
        userId: req.params.userId,
        appointmentStatus: pending,
      });
      const documents = await appointment
        .find({
          userId: req.params.userId,
          appointmentStatus: pending,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    if (booked) {
      const document = await appointment.find({
        userId: req.params.userId,
        appointmentStatus: booked,
      });
      const documents = await appointment
        .find({
          userId: req.params.userId,
          appointmentStatus: booked,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    if (cancelled) {
      const document = await appointment.find({
        userId: req.params.userId,
        appointmentStatus: cancelled,
      });
      const documents = await appointment
        .find({
          userId: req.params.userId,
          appointmentStatus: cancelled,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    if (rejected) {
      const document = await appointment.find({
        userId: req.params.userId,
        appointmentStatus: rejected,
      });
      const documents = await appointment
        .find({
          userId: req.params.userId,
          appointmentStatus: rejected,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    if (completed) {
      const document = await appointment.find({
        userId: req.params.userId,
        appointmentStatus: completed,
      });
      const documents = await appointment
        .find({
          userId: req.params.userId,
          appointmentStatus: completed,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    const document = await appointment.find(req.params);
    const documents = await appointment
      .find(req.params)
      .limit(limit ? limit : 30);
    if (documents.length === 0) {
      return res.status(404).json({ msg: `appointments not found` });
    }
    res.status(200).json({
      documents,
      objectCount: document.length,
      hasMore: document.length > documents.length ? true : false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// getting all appointments
const allAppointments = async (req, res) => {
  try {
    const booked = req.query.booked;
    const cancelled = req.query.cancelled;
    const rejected = req.query.rejected;
    const completed = req.query.completed;
    const pending = req.query.pending;
    // const limitQuery = req.query.limit;
    const limitQuery = req.query.limit;
    const limit = Number(limitQuery);
    if (cancelled) {
      const document = await find({
        appointmentStatus: cancelled,
      });
      const documents = await appointment
        .find({
          appointmentStatus: cancelled,
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    const documents = await find({});
    const allDoc = await appointment.find({}).limit(limit ? limit : 30);
    if (!allDoc) {
      res.status(404).json({ msg: `appointments not found` });
    }
    res.status(200).json({
      allDoc,
      objectCount: documents.length,
      hasMore: documents.length > allDoc.length ? true : false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createAppointment,
  updateAppointment,
  specificAppointment,
  allAppointments,
};
