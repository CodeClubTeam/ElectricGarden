import raygun from "raygun";

export const buildRaygunClient = (name: string) =>
  process.env.RAYGUN_API_KEY
    ? new raygun.Client().init({
        apiKey: process.env.RAYGUN_API_KEY,
        tags: [name],
        groupingKey: () => name,
      })
    : undefined;
