import * as faqService from '../services/faqService.js';
export const createFaq = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const faq = await faqService.createFaq(question, answer, category);
        res.status(201).json(faq);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category } = req.body;
        const faq = await faqService.updateFaq(parseInt(id, 10), question, answer, category);
        if (faq) {
            res.json(faq);
        }
        else {
            res.status(404).json({ message: 'FAQ not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await faqService.deleteFaq(parseInt(id, 10));
        if (faq) {
            res.json({ message: 'FAQ deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'FAQ not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getFaqs = async (req, res) => {
    try {
        const faqs = await faqService.getFaqs();
        res.json(faqs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const searchFaqs = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required.' });
        }
        const results = await faqService.searchFaqs(query);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
