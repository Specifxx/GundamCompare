import type { Post } from "./types";
import { post as gd06 } from "./gd06";
import { post as fakeCards } from "./fake-cards";
import { post as sixSetsIn } from "./six-sets-in";
import { post as expensive } from "./most-expensive";
import { post as banList } from "./ban-list";
import { post as rarities } from "./rarities";
import { post as whereToBuy } from "./where-to-buy";
import { post as boxOrSingles } from "./box-or-singles";
import { post as giftGuide } from "./gift-guide";
import { post as colours } from "./colours";
import { SET_POSTS } from "./set-chase";
import { post as blackFriday } from "./black-friday";

export const POSTS: Post[] = [blackFriday, fakeCards, sixSetsIn, giftGuide, colours, gd06, expensive, banList, rarities, whereToBuy, boxOrSingles, ...SET_POSTS];
