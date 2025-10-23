import aj from "#config/arcjet.js";
import { slidingWindow } from "@arcjet/node";
import logger from "#config/logger.js";

const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || "guest";
        let limit, messages;

        switch (role) {
            case "admin":
                limit = 20;
                messages = {
                    bot: "Admin bot request blocked",
                    shield: "Admin shield rule triggered",
                    rateLimit: "Admin rate limit exceeded (20 requests per minute)"
                };
                break;
            case "user":
                limit = 10;
                messages = {
                    bot: "User bot request blocked",
                    shield: "User shield rule triggered",
                    rateLimit: "User rate limit exceeded (10 requests per minute)"
                };
                break;
            default:
                limit = 5;
                messages = {
                    bot: "Guest bot request blocked",
                    shield: "Guest shield rule triggered",
                    rateLimit: "Guest rate limit exceeded (5 requests per minute)"
                };
        }

        const client = aj.withRule(slidingWindow({
            mode: "LIVE",
            interval: "1m",
            max: limit,
            name: `${role}-rate-limit`
        }));

        const decision = await client.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isBot()) {
                logger.warn(messages.bot, { ip: req.ip, userAgent: req.get("user-agent"), path: req.path });
                return res.status(403).json({ error: "forbidden", message: messages.bot });
            }

            if (decision.reason.isShield()) {
                logger.warn(messages.shield, { ip: req.ip, userAgent: req.get("user-agent"), path: req.path });
                return res.status(403).json({ error: "forbidden", message: messages.shield });
            }

            if (decision.reason.isRateLimit()) {
                logger.warn(messages.rateLimit, { ip: req.ip, userAgent: req.get("user-agent"), path: req.path });
                return res.status(403).json({ error: "forbidden", message: messages.rateLimit });
            }
        }

        // Allow request if not denied
        next();
    } catch (e) {
        console.error("Arcjet middleware error:", e.message);
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with the security middleware"
        });
    }
};

export default securityMiddleware;
