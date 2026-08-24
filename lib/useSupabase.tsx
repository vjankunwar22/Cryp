import { useAuth } from "@clerk/expo";
import { useMemo, useRef } from "react";
import { createClerkSupabaseClient } from "./supabase";

export function useSupbase(){
    const {getToken} = useAuth();
    const hasRefreshedToken = useRef(false);

    const client = useMemo (
        () => createClerkSupabaseClient(async () => {
            if (!hasRefreshedToken.current) {
                hasRefreshedToken.current = true;
                return getToken({ skipCache: true });
            }

            return getToken();
        }),
        [getToken],
    );

    return client;
}
