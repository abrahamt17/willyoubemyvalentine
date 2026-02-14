/**
 * Popular hobbies used in dating apps
 */

export const hobbies = [
  "Travel",
  "Photography",
  "Music",
  "Reading",
  "Cooking",
  "Fitness",
  "Gaming",
  "Movies",
  "Art",
  "Dancing",
  "Sports",
  "Hiking",
  "Yoga",
  "Writing",
  "Technology",
  "Fashion",
  "Food",
  "Animals",
  "Volunteering",
  "Learning Languages"
] as const;

export type Hobby = typeof hobbies[number];

