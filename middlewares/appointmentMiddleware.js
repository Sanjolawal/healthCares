//importing appointments collection
const appointment = require(`../schemas/appointmentSchema`);
// importing dependencies

// api for creating appointment
const createAppointment = async (req, res) => {
  try {
    const appointmentDoc = await appointment.find(req.params);
    if (appointmentDoc.length === 0) {
      const document = await appointment.create({
        ...req.body,
        userId: req.params.userId,
        timeslot: `pending`,
        price: `pending`,
        appointmentStatus: `pending`,
        appointmentId: `AP-${1}`,
        sd: Number(req.params.userId.split(`-`)[1]),
      });
      const test = await appointment
        .aggregate([
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

      res.status(200).json(test[0]);
    } else {
      const lastappointmentDoc = appointmentDoc[appointmentDoc.length - 1];
      const idNumber = Number(lastappointmentDoc.appointmentId.split(`-`)[1]);
      const document = await appointment.create({
        ...req.body,
        userId: req.params.userId,
        timeslot: `pending`,
        price: `pending`,
        appointmentStatus: `pending`,
        appointmentId: `AP-${idNumber + 1}`,
        sd: Number(req.params.userId.split(`-`)[1]),
      });
      const test = await appointment
        .aggregate([
          {
            $match: {
              appointmentId: `AP-${idNumber + 1}`,
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
      .findOneAndUpdate(req.params, req.body, {
        new: true,
      })
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }
    const response = await appointment
      .aggregate([
        {
          $match: {
            appointmentId: req.params.appointmentId,
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

module.exports = { createAppointment, updateAppointment };
