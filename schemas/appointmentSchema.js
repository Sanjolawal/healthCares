// importing mongoose for appointment schema and collection
const mongoose = require(`mongoose`);

// appointment schema or structure
const appointmentSchema = mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
  },
  scheduleId: {
    type: String,
    required: [true, `please provide valid schedule id`],
  },
  medicalCenterId: {
    type: String,
    required: [true, `please provide valid medicalCenter id`],
  },
  doctorId: {
    type: String,
    required: [true, `please provide valid doctor id`],
  },
  priceId: {
    type: String,
    required: [true, `please provide valid price id`],
  },
  patient: {
    userId: {
      type: String,
      required: [true, `please provide valid userId`],
    },
    patientType: {
      type: String,
      required: [true, `please provide valid patientType`],
    },
    patientId: {
      type: String,
      required: [true, `please provide valid patientId`],
    },
    patientName: {
      type: String,
      required: [true, `please provide valid patientName`],
    },
    patientRelationship: {
      type: String,
      required: [true, `please provide valid patientRelationship`],
    },
  },
  appointmentStatus: {
    type: String,
  },
  price: {
    type: String,
  },
  timeslot: String,
  notes: String,
  images: String,
  userId: {
    type: String,
    required: [true, `please provide valid userId`],
  },
  sd: { type: String, unique: true },
});

const appointment = mongoose.model(`appointment`, appointmentSchema);

// exporting appointment collection
module.exports = appointment;
