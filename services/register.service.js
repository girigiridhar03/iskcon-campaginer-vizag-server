import Register from "../models/register.modal.js";
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerService = async (req) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    throw new AppError("name is required", 400);
  }

  if (!email || !email.trim()) {
    throw new AppError("email is required", 400);
  }

  if (!password || !password.trim()) {
    throw new AppError("password is required", 400);
  }

  const userExist = await Register.findOne({ email });

  if (userExist) {
    throw new AppError("User already exist", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const newRegister = await Register.create({
    name,
    email,
    password: hashPassword,
    role: "admin",
  });

  return {
    status: 201,
    message: "Registered Successfully",
    newRegister,
  };
};

export const loginService = async (req) => {
  const { email, password } = req.body;

  if (!email?.trim()) {
    throw new AppError("Email is required", 400);
  }

  if (!password?.trim()) {
    throw new AppError("Password is required", 400);
  }

  const existingUser = await Register.findOne({ email });

  if (!existingUser) {
    throw new AppError(`Invalid credentials`, 401);
  }

  const isPassword = await bcrypt.compare(password, existingUser.password);

  if (!isPassword) {
    throw new AppError(`Invalid credentials`, 401);
  }

  const token = jwt.sign(
    {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    status: 200,
    message: "Login successfully",
    data: token,
  };
};

export const getAdminDetailsService = async (req) => {
  const user = req.user;

  const details = await Register.findById(user.id).select(
    "-createdAt -updatedAt -password",
  );

  if (!details) {
    throw new AppError("Not found", 404);
  }

  return {
    status: 200,
    message: "details fetched successfully",
    data: details,
  };
};
