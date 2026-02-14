export type User = {
  id: string;
  invite_code_id: string | null;
  anonymous_name: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  gender: string | null;
  whatsapp_number: string | null;
  room_number: string | null;
  hobbies: string[] | null;
  created_at: string;
};

export type InviteCode = {
  id: string;
  code: string;
  used: boolean;
  used_by: string | null;
};

export type RequestStatus = "pending" | "matched" | "cancelled";

export type Request = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: RequestStatus;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  reveal_a: boolean;
  reveal_b: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

export type SessionUser = {
  userId: string;
};


