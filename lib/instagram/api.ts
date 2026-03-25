// Instagram integration disabled per request.
export const getInstagramAuthorizeUrl = () => "";
export const exchangeCodeForToken = async () => {
  throw new Error("Instagram integration disabled");
};
export const fetchInstagramAccount = async () => {
  throw new Error("Instagram integration disabled");
};
export const fetchInstagramMedia = async () => [];
export const fetchMediaInsights = async () => null;
export const upsertInstagramAccount = async () => null;
