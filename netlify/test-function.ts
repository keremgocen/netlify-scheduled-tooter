import type { mastodon } from "masto";
import { login } from "masto";

// YOUR_BASE_DIRECTORY/netlify/functions/test-function.ts

import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  console.log("Received event:", event);

  const masto = await login({
    url: process.env.URL ?? "",
    accessToken: process.env.TOKEN,
  });

  // today_end = datetime(year_counter, month_now, day_now, 00, 00) + timedelta(days=1)
  //  yesterday_end = today_end - timedelta(days=1)
  //  #  Bitwise shift the integer representation and convert to milliseconds
  //  max_id = ( int( today_end.timestamp() )     << 16 ) * 1000
  //  min_id = ( int( yesterday_end.timestamp() ) << 16 ) * 1000
  const date = new Date();
  const dateRep =
    BigInt(date.setTime(date.getTime() - 1000 * 24 * 3600)) << 16n;
  const today: string = dateRep.toString();

  const statuses: mastodon.v1.Status[] = await masto.v1.accounts.listStatuses(
    process.env.USER_ID ?? "",
    {
      excludeReplies: true,
      excludeReblogs: true,
      minId: today,
    }
  );

  console.log(statuses.length);
  console.log(
    "mindId",
    today.toString(),
    date.setTime(date.getTime() - 1000 * 24 * 3600)
  );

  let i = 0;
  for (const s of statuses) {
    console.log("status createdAt", i++, s.createdAt, s.id, s.visibility);
  }

  const publicStatuses = statuses.filter((s) => s.visibility === "public");
  for (const s of publicStatuses) {
    console.log(
      "public status createdAt",
      s.createdAt,
      s.id,
      s.visibility,
      s.content
    );
  }

  // todo tweet these now

  return {
    statusCode: 200,
  };
};

export { handler };
