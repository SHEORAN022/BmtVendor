const Joi = require("joi");

const roomTypeSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  price: Joi.number().min(0).required(),
  maxGuests: Joi.number().min(1).default(2)
});

const documentsSchema = Joi.object({
  idProof: Joi.string().allow(""),
  propertyProof: Joi.string().allow(""),
  license: Joi.string().allow("")
});

const bnbValidationSchema = Joi.object({

  propertyName: Joi.string().min(3).max(100).required(),

  tagline: Joi.string().allow(""),
  description: Joi.string().allow(""),

  propertyType: Joi.string()
    .valid("Bed & Breakfast", "Hotel", "Hostel", "Villa")
    .default("Bed & Breakfast"),

  starCategory: Joi.number().min(1).max(5).default(3),

  establishedYear: Joi.number().min(1900).max(new Date().getFullYear()),

  ownerName: Joi.string().required(),

  companyName: Joi.string().allow(""),

  contactNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required(),

  alternateContact: Joi.string().allow(""),

  email: Joi.string().email().allow(""),

  website: Joi.string().uri().allow(""),

  password: Joi.string().min(6),

  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().default("India"),

  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),

  totalRooms: Joi.number().min(1),
  availableRooms: Joi.number().min(0),

  roomTypes: Joi.array().items(roomTypeSchema),

  basePrice: Joi.number().min(0),
  weekendPrice: Joi.number().min(0),
  extraGuestCharge: Joi.number().min(0),

  taxesIncluded: Joi.boolean().default(false),

  taxPercentage: Joi.when("taxesIncluded", {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.optional()
  }),

  breakfastIncluded: Joi.boolean().default(true),

  amenities: Joi.array().items(Joi.string()),

  checkIn: Joi.string(),
  checkOut: Joi.string(),

  instantBooking: Joi.boolean().default(true),

  minimumStay: Joi.number().min(1),
  maximumStay: Joi.number().min(1),

  cancellationPolicy: Joi.string(),

  accountNumber: Joi.when("gstNumber", {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),

  gstNumber: Joi.string().allow(""),

  propertyImages: Joi.array().items(Joi.string().uri()),

  documents: documentsSchema

});

module.exports = bnbValidationSchema;