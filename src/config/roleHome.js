// Where a signed-in person lands. Everyone (user / admin) shares the same app.
export const APP_PREFIX = '/app';
export const HOME = `${APP_PREFIX}/messages`;

export function roleHome() {
  return HOME;
}
