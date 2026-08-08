import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export const authMiddleware2 = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            next();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
};

export const authorizeReader = (req, res, next) => {
  if (req.user.role !== "Reader") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};

export const authorizeContri = (req, res, next) => {
  if (req.user.role !== "Contributor") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};