/**
 * Flower Routes
 * REST API and utilities for flower management
 */

import { Router } from 'express';
import { getSupabase, isSupabaseConfigured } from '../db/supabase.js';

const router = Router();

// In-memory fallback when Supabase is not configured
let inMemoryFlowers = [];

/**
 * Get all flowers
 */
export async function getAllFlowers() {
    if (!isSupabaseConfigured()) {
        return inMemoryFlowers;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('flowers')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching flowers:', error);
        return inMemoryFlowers;
    }
}

/**
 * Create a new flower
 */
export async function createFlower(flowerData) {
    const flower = {
        id: crypto.randomUUID(),
        x: flowerData.x,
        y: flowerData.y,
        image_data: flowerData.imageData,
        created_by: flowerData.createdBy,
        created_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured()) {
        inMemoryFlowers.push(flower);
        return flower;
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('flowers')
            .insert([flower])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating flower:', error);
        // Fallback to in-memory
        inMemoryFlowers.push(flower);
        return flower;
    }
}

// REST API Routes

// GET /api/flowers - Get all flowers
router.get('/', async (req, res) => {
    try {
        const flowers = await getAllFlowers();
        res.json(flowers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flowers' });
    }
});

// POST /api/flowers - Create a flower
router.post('/', async (req, res) => {
    try {
        const { x, y, imageData, createdBy } = req.body;

        if (x === undefined || y === undefined || !imageData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const flower = await createFlower({ x, y, imageData, createdBy });
        res.status(201).json(flower);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create flower' });
    }
});

// DELETE /api/flowers/:id - Delete a flower (admin only)
router.delete('/:id', async (req, res) => {
    // TODO: Add authentication
    try {
        if (!isSupabaseConfigured()) {
            inMemoryFlowers = inMemoryFlowers.filter(f => f.id !== req.params.id);
            return res.json({ success: true });
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('flowers')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete flower' });
    }
});

export default router;
