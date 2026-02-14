/**
 * Mature and flirty hobbies for dating apps
 */

export const hobbies = [
  "Wine Tasting",
  "Photography",
  "Live Music",
  "Reading",
  "Cooking Together",
  "Gym & Fitness",
  "Nightlife",
  "Cinema",
  "Art & Culture",
  "Dancing",
  "Adventure Sports",
  "Hiking & Nature",
  "Yoga & Wellness",
  "Writing & Poetry",
  "Tech & Innovation",
  "Fashion & Style",
  "Foodie",
  "Pet Lover",
  "Travel",
  "Philosophy & Deep Talks"
] as const;

export type Hobby = typeof hobbies[number];

