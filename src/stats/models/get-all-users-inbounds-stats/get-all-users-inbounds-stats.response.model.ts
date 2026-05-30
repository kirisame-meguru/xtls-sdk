import { QueryStatsResponse } from '../../../xray-protos/app/stats/command/command';
import { IUserInboundStat } from './interfaces';

/**
 * Model for handling and formatting per-user-per-inbound statistics response data.
 *
 * Counter names have the form:
 *   useri>>>{username}>>>inbound>>>{tag}>>>traffic>>>{uplink|downlink}
 * (6 segments). The strict segment guard below ensures this model never
 * mis-parses the 4-segment user>>> / inbound>>> / outbound>>> counter families
 * that share a prefix or suffix with these.
 */
export class GetAllUsersInboundsStatsResponseModel {
    /** Array of per-user-per-inbound statistics */
    public usersInbounds: IUserInboundStat[];

    /**
     * Creates an instance of GetAllUsersInboundsStatsResponseModel
     * @param data Raw stats response data from the query
     */
    constructor(data: QueryStatsResponse) {
        this.usersInbounds = this.parseData(data);
    }

    /**
     * Parses and formats the raw stats data into per-user-per-inbound statistics
     * @param data Raw stats response data containing individual stat entries
     * @returns Array of formatted per-user-per-inbound statistics
     */
    private parseData(data: QueryStatsResponse): IUserInboundStat[] {
        const map = new Map<string, IUserInboundStat>();

        for (const stat of data.stat) {
            const nameParts = stat.name.split('>>>');

            // Strict shape guard: useri / {username} / inbound / {tag} / traffic / {type}
            if (
                nameParts.length !== 6 ||
                nameParts[0] !== 'useri' ||
                nameParts[2] !== 'inbound' ||
                nameParts[4] !== 'traffic'
            ) {
                continue;
            }

            const username = nameParts[1];
            const inbound = nameParts[3];
            const type = nameParts[5];
            const value = stat.value;

            const key = `${username}>>>${inbound}`;
            let row = map.get(key);
            if (!row) {
                row = { username, inbound, uplink: 0, downlink: 0 };
                map.set(key, row);
            }

            if (type === 'uplink') {
                row.uplink += value;
            } else if (type === 'downlink') {
                row.downlink += value;
            }
        }

        return Array.from(map.values());
    }
}
