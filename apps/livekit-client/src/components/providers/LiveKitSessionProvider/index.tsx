import { apiEndpoints, loadEnv } from '@/configs';
import { SessionProvider, useSession } from '@livekit/components-react';
import '@livekit/components-styles';
import { TokenSource } from 'livekit-client';
import { type FC, useEffect, useMemo } from 'react';
import { type LiveKitSessionProviderProps } from './types';

export const LiveKitSessionProvider: FC<LiveKitSessionProviderProps> = ({
  children,
}) => {
  const tokenSource = useMemo(() => {
    let apiBaseUrl = loadEnv().apiBaseUrl;
    if (apiBaseUrl.endsWith('/')) apiBaseUrl = apiBaseUrl.slice(0, -1);
    return TokenSource.endpoint(
      `${apiBaseUrl}${apiEndpoints.post.liveKitToken()}`,
      {
        method: 'POST',
      },
    );
  }, []);

  const session = useSession(tokenSource);

  useEffect(() => {
    session.start();
    return () => {
      session.end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
