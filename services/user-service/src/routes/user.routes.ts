import express from "express";
import { registerUser, getUserById, updateUser, deleteUser, getAllUsers } from "../services/user.service";
import { hashPassword } from "../utils/hash";
import { authenticateToken, requireRole, requireOwnership, injectUserContext } from "../middleware/auth.middleware";

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long"
      });
    }

    // Role validation
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const userRole = role ? role.toUpperCase() : 'STUDENT';
    if (role && !validRoles.includes(userRole)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await registerUser({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      role: userRole as any
    });

    // Return user without password hash
    const { passwordHash: _, refreshToken: __, ...userResponse } = newUser;
    
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Get user by ID - Protected: users can only access their own profile, admins can access any
router.get("/:id", authenticateToken, injectUserContext, requireOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Return user without sensitive data
    const { passwordHash: _, refreshToken: __, ...userResponse } = user;
    res.json(userResponse);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Update user - Protected: users can only update their own profile, admins can update any
router.put("/:id", authenticateToken, injectUserContext, requireOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, profilePicture, metadata } = req.body;

    const updatedUser = await updateUser(id, {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      profilePicture,
      metadata
    });

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Return user without sensitive data
    const { passwordHash: _, refreshToken: __, ...userResponse } = updatedUser;
    res.json({
      message: "User updated successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Delete user (soft delete by setting isActive = false) - Protected: users can only delete their own account, admins can delete any
router.delete("/:id", authenticateToken, injectUserContext, requireOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await deleteUser(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// Get all users (admin functionality) - Protected: only admins can list all users
router.get("/", authenticateToken, injectUserContext, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    
    const users = await getAllUsers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: role as string
    });

    // Remove sensitive data from all users
    const sanitizedUsers = users.map(user => {
      const { passwordHash: _, refreshToken: __, ...userResponse } = user;
      return userResponse;
    });

    res.json({
      users: sanitizedUsers,
      total: sanitizedUsers.length
    });

  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// List students (teacher/admin) - Protected: teachers and admins can list students they manage
router.get("/students", authenticateToken, injectUserContext, requireRole(['TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await getAllUsers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: 'STUDENT'
    });

    const sanitizedUsers = users.map(user => {
      const { passwordHash: _, refreshToken: __, ...userResponse } = user;
      return userResponse;
    });

    res.json({
      users: sanitizedUsers,
      total: sanitizedUsers.length
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Quick lookup: is user a member of a course
router.get("/:id/courses/:courseId/membership", async (req, res) => {
  try {
    const { id, courseId } = req.params;
    // TODO: Implement when course/enrollment schema exists. Stubbed to false.
    res.json({ member: false, userId: id, courseId });
  } catch (error) {
    console.error("Membership check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;