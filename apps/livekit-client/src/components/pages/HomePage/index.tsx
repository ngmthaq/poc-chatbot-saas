import { useAgent } from '@livekit/components-react';

export const HomePage = () => {
  const agent = useAgent();

  return (
    <>
      {agent.canListen && (
        <div>
          <p>Agent ready!</p>
          <p>Agent is in state {agent.state}</p>

          {/* Show chat panel or other agent specific ui elements here */}
        </div>
      )}

      {agent.isFinished &&
        (agent.failureReasons && agent.failureReasons?.length > 0 ? (
          <p>Agent failed: {agent.failureReasons.join(', ')}</p>
        ) : (
          <p>Agent disconnected.</p>
        ))}
    </>
  );
};
