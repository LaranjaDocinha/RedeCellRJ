export const getStatus = (req, res) => {
    res.status(200).json({ status: 'Mobile App API is running', version: '1.0.0' });
};
