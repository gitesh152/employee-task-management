import bcrypt from 'bcrypt';

import { buildUserResponse, createUserAccount } from './auth.controller.js';
import prisma from '../config/database.config.js';
import { ROLES } from '../constants/roles.constant.js';
import logger from '../utils/logger.util.js';

export const buildUserListQuery = (query = {}) => {
  const rawSearch =
    typeof query?.search === 'string' ? query.search.trim() : '';
  const rawPage = Number.parseInt(String(query?.page ?? '1'), 10);
  const rawLimit = Number.parseInt(String(query?.limit ?? '10'), 10);
  const safePage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const safeLimit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;
  const sortBy =
    typeof query?.sortBy === 'string'
      ? query.sortBy.toLowerCase()
      : 'createdAt';
  const sortOrder = query?.sortOrder === 'asc' ? 'asc' : 'desc';
  const sortFieldMap = {
    name: 'fullName',
    email: 'email',
    department: 'department',
    designation: 'designation',
    createdat: 'createdAt',
    updatedAt: 'updatedAt',
  };
  const sortField = sortFieldMap[sortBy] ?? 'createdAt';

  const baseWhere = {
    role: ROLES.EMPLOYEE,
  };

  const where = rawSearch
    ? {
        ...baseWhere,
        OR: [
          { fullName: { contains: rawSearch } },
          { email: { contains: rawSearch } },
          { department: { contains: rawSearch } },
          { designation: { contains: rawSearch } },
        ],
      }
    : baseWhere;

  return {
    where,
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};

export const createUser = async (req, res, next) => {
  try {
    /** Create a new employee account from admin input and persist it safely */
    const email = String(req.body.email || '');
    const name = String(req.body.name || '');
    const password = req.body.password;
    const department = req.body.department ?? null;
    const designation = req.body.designation ?? null;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({
        message: 'Email already registered!',
      });
    }

    const user = await createUserAccount({
      name,
      email,
      password,
      department,
      designation,
      role: 'EMPLOYEE',
    });

    const userObj = buildUserResponse(user);

    logger.info('User registered.', userObj);

    return res.status(201).json({
      message: 'User added successfully',
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    /** Fetch paginated employee records with optional search and sorting */
    const queryOptions = buildUserListQuery(req.query);
    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        ...queryOptions,
      }),
      prisma.user.count({ where: queryOptions.where }),
    ]);

    const page = Math.floor(queryOptions.skip / queryOptions.take) + 1;
    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / queryOptions.take);

    return res.status(200).json({
      message: 'Employees retrieved successfully',
      pagination: {
        page,
        limit: queryOptions.take,
        totalItems,
        totalPages,
      },
      users: users.map(buildUserResponse),
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    if (req.user?.role !== ROLES.ADMIN) {
      return res.status(403).json({
        message: 'You do not have permission to view this user.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      message: 'Employee retrieved successfully',
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    /** Apply partial updates to an employee profile while validating unique email changes */
    const userId = req.params.id;
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if (!existing) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    const updateData = {};

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      updateData.fullName = req.body.name.trim();
    }

    if (typeof req.body.email === 'string' && req.body.email.trim()) {
      const email = req.body.email.trim().toLowerCase();
      if (email !== existing.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email } });
        if (emailTaken) {
          return res.status(409).json({
            message: 'Email already registered!',
          });
        }
      }
      updateData.email = email;
    }

    if (req.body.department !== undefined) {
      updateData.department = req.body.department
        ? String(req.body.department).trim()
        : null;
    }

    if (req.body.designation !== undefined) {
      updateData.designation = req.body.designation
        ? String(req.body.designation).trim()
        : null;
    }

    if (req.body.role !== undefined) {
      updateData.role = req.body.role;
    }

    if (typeof req.body.password === 'string' && req.body.password.trim()) {
      updateData.password = await bcrypt.hash(req.body.password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update.',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return res.status(200).json({
      message: 'Employee updated successfully',
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    /** Remove an employee account while blocking admin deletion */
    const userId = req.params.id;
    const existing = await prisma.user.findUnique({ where: { id: userId } });

    if (!existing) {
      return res.status(404).json({
        message: 'Employee not found',
      });
    }

    if (existing.role === ROLES.ADMIN) {
      return res.status(403).json({
        message: 'Cannot delete an admin user.',
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      message: 'Employee deleted successfully',
      userId,
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res, next) => {
  try {
    /** Return the identity by the authenticate middleware */
    return res.status(200).json({
      message: 'User Info',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
