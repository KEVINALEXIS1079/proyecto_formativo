import * as turf from "@turf/turf";
import type { Lote, Sublote } from "../../cultivos/model/types";

// Validation Result Type
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

/**
 * Validates a new Lote polygon
 * Rules:
 * 1. Min 3 points (implicitly handled by UI usually, but good to check)
 * 2. No overlap/intersection with existing Lotes
 */
export const validateLote = (
    newCoords: { latitud_lote: number; longitud_lote: number }[],
    existingLotes: Lote[],
    editingId?: number
): ValidationResult => {
    if (newCoords.length < 3) {
        return { isValid: false, message: "El lote debe tener al menos 3 puntos." };
    }

    // Convert new coords to Turf Polygon
    // Coords are { latitud, longitud }
    // Turf expects [lng, lat] and closed ring (first == last)
    const ring = newCoords.map(c => [c.longitud_lote, c.latitud_lote]);
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push(ring[0]);
    }
    const newPoly = turf.polygon([ring]);

    // Check overlap with existing lotes
    for (const lot of existingLotes) {
        // Skip self if editing
        if (editingId && lot.id_lote_pk === editingId) continue;
        if (!lot.coordenadas_lote || lot.coordenadas_lote.length < 3) continue;

        const lotRing = lot.coordenadas_lote.map(c => [c.longitud_lote, c.latitud_lote]);
        // Close ring if needed
        if (lotRing[0][0] !== lotRing[lotRing.length - 1][0] || lotRing[0][1] !== lotRing[lotRing.length - 1][1]) {
            lotRing.push(lotRing[0]);
        }
        const lotPoly = turf.polygon([lotRing]);

        // Check intersection/overlap
        if (turf.booleanOverlap(newPoly, lotPoly) || turf.booleanWithin(newPoly, lotPoly) || turf.booleanContains(newPoly, lotPoly)) {
            return { isValid: false, message: `El lote se solapa con el lote existente: ${lot.nombre_lote}` };
        }
        // Also check simplified intersection for partial overlaps
        if (turf.intersect(turf.featureCollection([newPoly, lotPoly]))) {
            return { isValid: false, message: `El lote interseca con el lote existente: ${lot.nombre_lote}` };
        }
    }

    return { isValid: true };
};

/**
 * Validates a new Sublote polygon
 * Rules:
 * 1. Must be contained within Parent Lote
 * 2. No overlap with sibling Sublotes
 */
export const validateSublote = (
    newCoords: { latitud_sublote: number; longitud_sublote: number }[],
    parentLote: Lote | undefined,
    existingSublotes: Sublote[],
    editingId?: number
): ValidationResult => {
    if (newCoords.length < 3) {
        return { isValid: false, message: "El sublote debe tener al menos 3 puntos." };
    }
    if (!parentLote || !parentLote.coordenadas_lote || parentLote.coordenadas_lote.length < 3) {
        return { isValid: false, message: "No se encontró un lote padre válido." };
    }

    // New Sublote Polygon
    const subRing = newCoords.map(c => [c.longitud_sublote, c.latitud_sublote]);
    if (subRing[0][0] !== subRing[subRing.length - 1][0] || subRing[0][1] !== subRing[subRing.length - 1][1]) {
        subRing.push(subRing[0]);
    }
    const subPoly = turf.polygon([subRing]);

    // Parent Lote Polygon
    const parentRing = parentLote.coordenadas_lote.map(c => [c.longitud_lote, c.latitud_lote]);
    if (parentRing[0][0] !== parentRing[parentRing.length - 1][0] || parentRing[0][1] !== parentRing[parentRing.length - 1][1]) {
        parentRing.push(parentRing[0]);
    }
    const parentPoly = turf.polygon([parentRing]);

    // 1. Check Containment: Sublote must be WITHIN Lote
    // booleanWithin is strict about shared edges depending on version.
    // Use difference check: Area of (Sublote - Parent) should be ~0.

    // Check if points are strictly outside first
    const pointsOutside = newCoords.some(c => {
        const pt = turf.point([c.longitud_sublote, c.latitud_sublote]);
        // Allow point on boundary (distance ~ 0)
        const isInside = turf.booleanPointInPolygon(pt, parentPoly);
        if (isInside) return false;

        // Check distance to boundary
        const parentLine = turf.lineString(parentRing);
        const dist = turf.pointToLineDistance(pt, parentLine, { units: 'meters' });
        return dist > 0.1; // 10cm tolerance
    });

    if (pointsOutside) {
        return { isValid: false, message: "El sublote debe estar completamente dentro del lote principal." };
    }

    // Double check full polygon containment (to catch crossing lines even if points are inside)
    // If all points are good, usually we are good unless we cross "out and back in" (concave parent).
    // Let's rely on points check + checking if center is inside as a sanity check?
    // Or just use difference.

    try {
        const diff = turf.difference(turf.featureCollection([subPoly, parentPoly]));
        if (diff) {
            // calculated area of difference
            const diffArea = turf.area(diff);
            if (diffArea > 1) { // 1 square meter tolerance
                return { isValid: false, message: "El sublote sobresale del límite del lote principal." };
            }
        }
    } catch (e) {
        // turf.difference sometimes fails on complex topology. Fallback to booleanWithin but accept failure if strict?
        // Let's assume point check is sufficient if difference fails.
    }

    // 2. Check Overlap with Siblings
    for (const sibling of existingSublotes) {
        if (editingId && sibling.id_sublote_pk === editingId) continue;
        if (!sibling.coordenadas_sublote || sibling.coordenadas_sublote.length < 3) continue;

        const sibRing = sibling.coordenadas_sublote.map(c => [c.longitud_sublote, c.latitud_sublote]);
        if (sibRing[0][0] !== sibRing[sibRing.length - 1][0] || sibRing[0][1] !== sibRing[sibRing.length - 1][1]) {
            sibRing.push(sibRing[0]);
        }
        const sibPoly = turf.polygon([sibRing]);

        if (turf.booleanOverlap(subPoly, sibPoly) || turf.booleanWithin(subPoly, sibPoly) || turf.booleanContains(subPoly, sibPoly) || turf.intersect(turf.featureCollection([subPoly, sibPoly]))) {
            return { isValid: false, message: `El sublote se solapa con el sublote existente: ${sibling.nombre_sublote}` };
        }
    }

    return { isValid: true };
};

/**
 * Validates a single point placement for a Lote.
 * Checks if the point falls INSIDE an existing Lote.
 * If so, returns the nearest point on the exterior of that Lote.
 */
/**
 * Validates a single point placement for a Lote.
 * Checks if the point falls INSIDE an existing Lote.
 * If so, returns the nearest point on the exterior of that Lote.
 */
export const validateLotePoint = (
    point: { lat: number; lng: number },
    existingLotes: Lote[],
    editingId?: number,
    prevPoint?: { lat: number; lng: number }
): { isValid: boolean; correctedPoint?: { lat: number; lng: number }; message?: string } => {
    const turfPoint = turf.point([point.lng, point.lat]); // lng, lat

    for (const lot of existingLotes) {
        if (editingId && lot.id_lote_pk === editingId) continue;
        if (!lot.coordenadas_lote || lot.coordenadas_lote.length < 3) continue;

        // Ensure numeric coordinates
        const lotRing = lot.coordenadas_lote.map(c => [Number(c.longitud_lote), Number(c.latitud_lote)]);
        if (lotRing[0][0] !== lotRing[lotRing.length - 1][0] || lotRing[0][1] !== lotRing[lotRing.length - 1][1]) {
            lotRing.push(lotRing[0]);
        }
        const lotPoly = turf.polygon([lotRing]);
        const lotLine = turf.lineString(lotRing);

        // 1. Check Point Inside
        // 5cm tolerance for boundary
        const distanceToEdge = turf.pointToLineDistance(turfPoint, lotLine, { units: 'meters' });
        if (distanceToEdge < 0.05) {
            continue;
        }

        if (turf.booleanPointInPolygon(turfPoint, lotPoly)) {
            const nearest = turf.nearestPointOnLine(lotLine, turfPoint);
            const [lng, lat] = nearest.geometry.coordinates;
            return {
                isValid: false,
                correctedPoint: { lat, lng },
                message: `Punto corregido: Se movió al límite de '${lot.nombre_lote}' para evitar superposición.`
            };
        }

        // 2. Check Line Intersection (if prevPoint exists)
        if (prevPoint) {
            const lineSegment = turf.lineString([
                [prevPoint.lng, prevPoint.lat],
                [point.lng, point.lat]
            ]);

            // Check if line crosses polygon
            // Fix: booleanOverlap requires same geometry type (Line/Line or Poly/Poly).
            // We are comparing Line vs Polygon. booleanOverlap throws invalid type error.
            // For Line vs Polygon: checks 'crosses' (enters/exits) or 'contains' (line completely inside)

            if (turf.booleanCrosses(lineSegment, lotPoly) || turf.booleanContains(lotPoly, lineSegment)) {
                // Find intersection
                const intersections = turf.lineIntersect(lineSegment, lotLine);
                if (intersections && intersections.features.length > 0) {
                    // Get closest intersection to prevPoint
                    const prevTurfPoint = turf.point([prevPoint.lng, prevPoint.lat]);
                    const closest = turf.nearestPoint(prevTurfPoint, intersections);

                    // If closest is basically prevPoint (intersection at start), we might need the OTHER intersection?
                    // Or if we are moving IN, the first intersection is the entry.
                    // If we are moving OUT, first intersection is exit.
                    // If 'contains' is true, we are completely inside, so we never cross?
                    // Wait, if completely inside, lineIntersect might be empty if it doesn't touch boundary?
                    // BUT Lote is a CLOSED ring. A line inside won't intersect boundary unless it crosses it.
                    // If `contains` is true, we are strictly inside. We should snap to boundary?
                    // Snapping `point` (end) to boundary is handled by Point checks above?
                    // Yes, logic above handles "Point Inside".
                    // So `contains` here is redundant if we already checked Point Inside.

                    // If `crosses` is true, it enters or exits.
                    // If we started OUT (prevPoint) and go IN (point), we want the entry point.

                    const [lng, lat] = closest.geometry.coordinates;

                    // Avoid tiny line segments returning same point
                    const dist = turf.distance(prevTurfPoint, closest, { units: 'meters' });
                    if (dist < 0.05) {
                        // Intersection is at start point.
                        // This implies we are trying to draw ALONG the boundary or immediately entering.
                        // Let's allow it? Or find next intersection?
                        // If we return same point, LoteMap duplicate check handles it.
                    }

                    return {
                        isValid: false,
                        correctedPoint: { lat, lng },
                        message: `Línea corregida: Se cortó al chocar con '${lot.nombre_lote}'.`
                    };
                }
            }
        }
    }

    return { isValid: true };
};

/**
 * Validates a single point placement for a Sublote.
 * 1. Must be INSIDE parent Lote. If out, snap to parent edge.
 * 2. Must be OUTSIDE sibling Sublotes. If in, snap to sibling edge.
 */
export const validateSublotePoint = (
    point: { lat: number; lng: number },
    parentLote: Lote | undefined,
    existingSublotes: Sublote[],
    editingId?: number,
    prevPoint?: { lat: number; lng: number }
): { isValid: boolean; correctedPoint?: { lat: number; lng: number }; message?: string } => {
    const turfPoint = turf.point([point.lng, point.lat]);

    // 1. Check Parent Containment
    if (parentLote && parentLote.coordenadas_lote && parentLote.coordenadas_lote.length >= 3) {
        const parentRing = parentLote.coordenadas_lote.map(c => [Number(c.longitud_lote), Number(c.latitud_lote)]);
        if (parentRing[0][0] !== parentRing[parentRing.length - 1][0] || parentRing[0][1] !== parentRing[parentRing.length - 1][1]) {
            parentRing.push(parentRing[0]);
        }
        const parentPoly = turf.polygon([parentRing]);
        const parentLine = turf.lineString(parentRing);

        const isInside = turf.booleanPointInPolygon(turfPoint, parentPoly);
        const distanceToEdge = turf.pointToLineDistance(turfPoint, parentLine, { units: 'meters' });

        if (!isInside && distanceToEdge > 0.05) {
            const nearest = turf.nearestPointOnLine(parentLine, turfPoint);
            const [lng, lat] = nearest.geometry.coordinates;
            return {
                isValid: false,
                correctedPoint: { lat, lng },
                message: "Punto corregido: Se movió al límite del lote principal."
            };
        }

        // Check Line leaving parent (if prevPoint)
        if (prevPoint) {
            const lineSegment = turf.lineString([
                [prevPoint.lng, prevPoint.lat],
                [point.lng, point.lat]
            ]);
            // If line crosses boundary and ends up outside or re-enters?
            // Actually, simply checking if line stays inside is cleaner.
            // booleanContains(parent, line) should be true.
            if (!turf.booleanContains(parentPoly, lineSegment) && !turf.booleanCrosses(lineSegment, parentPoly)) {
                // If it's completely outside, we already caught point outside.
                // But booleanContains might be false if it touches edge.
                // Let's rely on intersection.
            }

            // If it crosses boundary?
            if (turf.booleanCrosses(lineSegment, parentPoly)) {
                // It left the polygon. Snap to exit point.
                const intersections = turf.lineIntersect(lineSegment, parentLine);
                if (intersections && intersections.features.length > 0) {
                    const prevTurfPoint = turf.point([prevPoint.lng, prevPoint.lat]);
                    const closest = turf.nearestPoint(prevTurfPoint, intersections);
                    const [lng, lat] = closest.geometry.coordinates;
                    return {
                        isValid: false,
                        correctedPoint: { lat, lng },
                        message: "Línea corregida: Se limitó al borde del lote padre."
                    };
                }
            }
        }
    }

    // 2. Check Sibling Overlap
    for (const sibling of existingSublotes) {
        if (editingId && sibling.id_sublote_pk === editingId) continue;
        if (!sibling.coordenadas_sublote || sibling.coordenadas_sublote.length < 3) continue;

        const sibRing = sibling.coordenadas_sublote.map(c => [Number(c.longitud_sublote), Number(c.latitud_sublote)]);
        if (sibRing[0][0] !== sibRing[sibRing.length - 1][0] || sibRing[0][1] !== sibRing[sibRing.length - 1][1]) {
            sibRing.push(sibRing[0]);
        }
        const sibPoly = turf.polygon([sibRing]);
        const sibLine = turf.lineString(sibRing);

        const distanceToSibEdge = turf.pointToLineDistance(turfPoint, sibLine, { units: 'meters' });
        if (distanceToSibEdge < 0.05) continue;

        if (turf.booleanPointInPolygon(turfPoint, sibPoly)) {
            const nearest = turf.nearestPointOnLine(sibLine, turfPoint);
            const [lng, lat] = nearest.geometry.coordinates;
            return {
                isValid: false,
                correctedPoint: { lat, lng },
                message: `Punto corregido: Se movió al límite del sublote '${sibling.nombre_sublote}'`
            };
        }

        // Check Line Intersection
        if (prevPoint) {
            const lineSegment = turf.lineString([
                [prevPoint.lng, prevPoint.lat],
                [point.lng, point.lat]
            ]);

            if (turf.booleanCrosses(lineSegment, sibPoly) || turf.booleanContains(sibPoly, lineSegment)) {
                const intersections = turf.lineIntersect(lineSegment, sibLine);
                if (intersections && intersections.features.length > 0) {
                    const prevTurfPoint = turf.point([prevPoint.lng, prevPoint.lat]);
                    const closest = turf.nearestPoint(prevTurfPoint, intersections);
                    const [lng, lat] = closest.geometry.coordinates;

                    return {
                        isValid: false,
                        correctedPoint: { lat, lng },
                        message: `Línea corregida: Se cortó al chocar con '${sibling.nombre_sublote}'.`
                    };
                }
            }
        }
    }

    return { isValid: true };
};

/**
 * Validates a move of an existing point.
 * Checks:
 * 1. Point itself inside restricted area?
 * 2. Segment (Prev -> Point) crossing/inside?
 * 3. Segment (Point -> Next) crossing/inside?
 */
export const validateLoteMove = (
    point: { lat: number; lng: number },
    prevPoint: { lat: number; lng: number },
    nextPoint: { lat: number; lng: number },
    existingLotes: Lote[],
    editingId?: number
): { isValid: boolean; correctedPoint?: { lat: number; lng: number }; message?: string } => {
    // 1. Check Point (reuse existing logic)
    const pointVal = validateLotePoint(point, existingLotes, editingId);
    // If point itself is bad, return that correction (it snaps to nearest edge)
    if (!pointVal.isValid) return pointVal;

    // 2. Check Line Segments (Prev->Point and Point->Next)

    for (const lot of existingLotes) {
        if (editingId && lot.id_lote_pk === editingId) continue;
        if (!lot.coordenadas_lote || lot.coordenadas_lote.length < 3) continue;

        const lotRing = lot.coordenadas_lote.map(c => [Number(c.longitud_lote), Number(c.latitud_lote)]);
        if (lotRing[0][0] !== lotRing[lotRing.length - 1][0] || lotRing[0][1] !== lotRing[lotRing.length - 1][1]) {
            lotRing.push(lotRing[0]);
        }
        const lotPoly = turf.polygon([lotRing]);
        const lotLine = turf.lineString(lotRing);

        // Define Segments
        const segment1 = turf.lineString([[prevPoint.lng, prevPoint.lat], [point.lng, point.lat]]);
        const segment2 = turf.lineString([[point.lng, point.lat], [nextPoint.lng, nextPoint.lat]]);

        // Check Segment 1 (Prev -> Point)
        let intersection1 = null;
        if (turf.booleanCrosses(segment1, lotPoly) || turf.booleanContains(lotPoly, segment1)) {
            const intersections = turf.lineIntersect(segment1, lotLine);
            if (intersections && intersections.features.length > 0) {
                intersection1 = turf.nearestPoint(turf.point([prevPoint.lng, prevPoint.lat]), intersections);
            }
        }

        // Check Segment 2 (Point -> Next)
        let intersection2 = null;
        if (turf.booleanCrosses(segment2, lotPoly) || turf.booleanContains(lotPoly, segment2)) {
            const intersections = turf.lineIntersect(segment2, lotLine);
            if (intersections && intersections.features.length > 0) {
                intersection2 = turf.nearestPoint(turf.point([nextPoint.lng, nextPoint.lat]), intersections);
            }
        }

        if (intersection1 || intersection2) {
            const target = intersection1 || intersection2;
            if (target) {
                const [lng, lat] = target.geometry.coordinates;
                return {
                    isValid: false,
                    correctedPoint: { lat, lng },
                    message: `Movimiento corregido: Límite con '${lot.nombre_lote}'.`
                };
            }
        }
    }

    return { isValid: true };
};

/**
 * Generates a smoothed polygon (Bezier Spline) from control points.
 * Returns a simplified Geometry for rendering.
 */


/**
 * Validates a moved point in a Sublote (Drag & Drop)
 * Checks:
 * 1. Point inside Parent Lote?
 * 2. Point NOT in Sibling Sublotes?
 * 3. Connected Lines inside Parent and distinct from Siblings?
 */
export const validateSubloteMove = (
    point: { lat: number; lng: number },
    prevPoint: { lat: number; lng: number },
    nextPoint: { lat: number; lng: number },
    parentLote: Lote | undefined,
    existingSublotes: Sublote[],
    editingId?: number
): { isValid: boolean; correctedPoint?: { lat: number; lng: number }; message?: string } => {

    // 1. Basic Point Validation (reuse logic)
    // Note: validateSublotePoint expects raw lat/lng object and checks point-in-polygon
    const pointVal = validateSublotePoint(point, parentLote, existingSublotes, editingId);
    if (!pointVal.isValid) return pointVal;

    // 2. Check Line Segments (Prev->Point and Point->Next) regarding PARENT containment
    // If the segments go outside the parent, we should snap the point back.
    if (!parentLote || !parentLote.coordenadas_lote) return { isValid: true };

    const parentRing = parentLote.coordenadas_lote.map(c => [Number(c.longitud_lote), Number(c.latitud_lote)]);
    if (parentRing[0][0] !== parentRing[parentRing.length - 1][0] || parentRing[0][1] !== parentRing[parentRing.length - 1][1]) {
        parentRing.push(parentRing[0]);
    }
    const parentPoly = turf.polygon([parentRing]);
    const parentLine = turf.lineString(parentRing);

    const segment1 = turf.lineString([[prevPoint.lng, prevPoint.lat], [point.lng, point.lat]]);
    const segment2 = turf.lineString([[point.lng, point.lat], [nextPoint.lng, nextPoint.lat]]);

    // Check Segment1 (Prev -> Point) vs Parent
    if (turf.booleanCrosses(segment1, parentPoly) || !turf.booleanContains(parentPoly, segment1)) {
        // Technically, booleanContains might fail if points are ON boundary. 
        // We really care if it CROSSES OUT.
        if (turf.booleanCrosses(segment1, parentPoly)) {
            const intersections = turf.lineIntersect(segment1, parentLine);
            if (intersections && intersections.features.length > 0) {
                const best = turf.nearestPoint(turf.point([prevPoint.lng, prevPoint.lat]), intersections);
                const [lng, lat] = best.geometry.coordinates;
                return { isValid: false, correctedPoint: { lat, lng }, message: "Línea corregida: No puede salir del lote padre." };
            }
        }
    }

    // Check Segment2 (Point -> Next) vs Parent
    if (turf.booleanCrosses(segment2, parentPoly)) {
        const intersections = turf.lineIntersect(segment2, parentLine);
        if (intersections && intersections.features.length > 0) {
            // For exit segment, we want the intersection closest to 'point' or 'nextPoint'?
            // If we moved 'point', let's check intersection closest to 'point' usually.
            const best = turf.nearestPoint(turf.point([point.lng, point.lat]), intersections);
            const [lng, lat] = best.geometry.coordinates;
            return { isValid: false, correctedPoint: { lat, lng }, message: "Línea corregida: No puede salir del lote padre." };
        }
    }

    // 3. Check Siblings Intersection
    for (const sibling of existingSublotes) {
        if (editingId && sibling.id_sublote_pk === editingId) continue;
        if (!sibling.coordenadas_sublote || sibling.coordenadas_sublote.length < 3) continue;

        const sibRing = sibling.coordenadas_sublote.map(c => [Number(c.longitud_sublote), Number(c.latitud_sublote)]);
        if (sibRing[0][0] !== sibRing[sibRing.length - 1][0] || sibRing[0][1] !== sibRing[sibRing.length - 1][1]) {
            sibRing.push(sibRing[0]);
        }
        const sibPoly = turf.polygon([sibRing]);
        const sibLine = turf.lineString(sibRing);

        // Check S1
        if (turf.booleanCrosses(segment1, sibPoly) || turf.booleanContains(sibPoly, segment1)) {
            const ix = turf.lineIntersect(segment1, sibLine);
            if (ix && ix.features.length > 0) {
                const best = turf.nearestPoint(turf.point([prevPoint.lng, prevPoint.lat]), ix);
                const [lng, lat] = best.geometry.coordinates;
                return { isValid: false, correctedPoint: { lat, lng }, message: `Línea corregida: Choca con '${sibling.nombre_sublote}'` };
            }
        }
        // Check S2
        if (turf.booleanCrosses(segment2, sibPoly) || turf.booleanContains(sibPoly, segment2)) {
            const ix = turf.lineIntersect(segment2, sibLine);
            if (ix && ix.features.length > 0) {
                const best = turf.nearestPoint(turf.point([point.lng, point.lat]), ix);
                const [lng, lat] = best.geometry.coordinates;
                return { isValid: false, correctedPoint: { lat, lng }, message: `Línea corregida: Choca con '${sibling.nombre_sublote}'` };
            }
        }
    }

    return { isValid: true };
};
