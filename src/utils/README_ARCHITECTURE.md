# Business & Service Architecture

This document explains the difference between **Business Types** and **Service Types** in the application.

## Business Type

**Business Type** defines what category/industry your business operates in. This is set once when registering your business.

### Location in Database
- Table: `businesses`
- Column: `business_type` (enum type)
- Examples: `barbershop`, `hair_salon`, `cleaning_service`, `fitness_center`, `medspa`

### Available Business Types
1. Barbershop
2. Hair Salon
3. Makeup Artist
4. Nail Salon
5. Spa
6. Beauty Clinic
7. Fashion Designer
8. Cleaning Service
9. Fitness Center
10. Massage Therapy
11. Tattoo Parlor
12. Medical Spa

### File Locations
- Definition: `src/utils/businessTypes.ts`
- Used in:
  - `src/components/business/steps/BusinessInfoStep.tsx` (Multi-step registration)
  - `src/components/business/BusinessRegistrationModal.tsx` (Quick registration)
  - `src/components/ProfileManagement.tsx` (Profile editing)

---

## Service Type

**Service Type** (also called Service Category) categorizes individual services that your business offers. One business can offer services from multiple service types.

### Location in Database
- Table: `services`
- Column: `service_type` (text field, nullable)
- Examples: "Hair Services", "Coloring", "Cleaning Services", "Fitness Services"

### Available Service Types
1. Hair Services
2. Styling & Treatment
3. Coloring
4. Nail Services
5. Spa & Massage
6. Facial & Skincare
7. Body Treatments
8. Waxing & Hair Removal
9. Makeup
10. Barber Services
11. Beauty Services
12. Cleaning Services
13. Fitness Services
14. Massage Services
15. Tattoo & Body Art
16. Medical Aesthetics

### File Locations
- Definition: `src/utils/serviceSuggestions.ts`
- Used in:
  - `src/components/ServicesManagement.tsx` (When adding/editing services)

### Service Suggestions
Each service type includes pre-defined service name suggestions. For example:
- **Cleaning Services**: "Standard Cleaning", "Deep Cleaning", "Office Cleaning", etc.
- **Fitness Services**: "Personal Training", "Yoga Session", "HIIT Training", etc.

---

## Examples

### Example 1: Hair Salon
- **Business Type**: `hair_salon`
- **Services Offered**:
  - Service 1: "Women's Haircut" (Service Type: "Hair Services")
  - Service 2: "Balayage" (Service Type: "Coloring")
  - Service 3: "Keratin Treatment" (Service Type: "Styling & Treatment")

### Example 2: Fitness Center
- **Business Type**: `fitness_center`
- **Services Offered**:
  - Service 1: "Personal Training" (Service Type: "Fitness Services")
  - Service 2: "Yoga Session" (Service Type: "Fitness Services")
  - Service 3: "Nutrition Consultation" (Service Type: "Fitness Services")
  - Service 4: "Deep Tissue Massage" (Service Type: "Massage Services")

### Example 3: Medical Spa
- **Business Type**: `medspa`
- **Services Offered**:
  - Service 1: "Botox Treatment" (Service Type: "Medical Aesthetics")
  - Service 2: "Laser Hair Removal" (Service Type: "Medical Aesthetics")
  - Service 3: "Anti-Aging Facial" (Service Type: "Facial & Skincare")

---

## Key Differences

| Aspect | Business Type | Service Type |
|--------|--------------|-------------|
| **Purpose** | Defines the business category | Categorizes individual services |
| **Quantity** | One per business | Many per business |
| **When Set** | During business registration | When adding each service |
| **Database** | `businesses.business_type` | `services.service_type` |
| **Type** | Enum (fixed values) | Text (flexible) |
| **Required** | Yes | No (optional) |

---

## Adding New Types

### To Add a New Business Type:
1. Run database migration to add value to `business_type` enum
2. Update `src/utils/businessTypes.ts` with new type
3. Types automatically appear in all registration/profile forms

### To Add a New Service Type:
1. Add to `SERVICE_TYPES` array in `src/utils/serviceSuggestions.ts`
2. Add corresponding suggestions in `SERVICE_SUGGESTIONS` object
3. Type automatically appears in service management dropdown
