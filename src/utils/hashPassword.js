import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    try {
        const salt = bcrypt.genSaltSync(parseInt(SALT_ROUNDS));
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Error hashing password: ${error.message}`);
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error(`Error comparing passwords: ${error.message}`);
    }
};