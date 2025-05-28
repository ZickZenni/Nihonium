export default interface DiscordApiUser {
  id: string;
  username: string;
  global_name: string | null;
  discriminator: string;
  avatar: string | null;
  banner: string | null;
  verified?: boolean;
  system?: boolean;
  bot?: boolean;
  phone?: string | null;
  email?: string | null;
  mobile?: boolean;
  desktop?: boolean;
}
