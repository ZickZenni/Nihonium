import DiscordApiUser from '@main/api/types/user';

/**
 * Dispatch data for the event READY.
 */
export default interface GatewayReadyDispatchData {
  session_id: string;
  resume_gateway_url: string;
  user: DiscordApiUser;
}
