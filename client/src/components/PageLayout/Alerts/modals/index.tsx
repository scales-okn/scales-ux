import React from "react";

import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

import ConnectModal from "./ConnectModal";
import TeamModal from "./TeamModal";
import NewTeamNotebookModal from "./NewTeamNotebookModal";
import ConnectResponseModal from "./ConnectResponseModal";
import RingUpdatedModal from "./RingUpdatedModal";
import NotebookSharedModal from "./NotebookSharedModal";
import NotebookRemovedModal from "./NotebookRemovedModal";

const ModalAlertElement = ({ modalAlert, setModalAlert }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const search = queryString.parse(location.search);

  const modals = {
    connect: (
      <ConnectModal
        open={!!modalAlert}
        onClose={() => {
          delete search.connectionId;
          navigate({
            search: queryString.stringify(search),
          });
          setModalAlert(null);
        }}
        alert={modalAlert}
      />
    ),
    addedToTeam: (
      <TeamModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
        added={true}
      />
    ),
    removedFromTeam: (
      <TeamModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
        added={false}
      />
    ),
    notebookAddedToTeam: (
      <NewTeamNotebookModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
    ringUpdated: (
      <RingUpdatedModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
    connectResponse: (
      <ConnectResponseModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
    notebookShared: (
      <NotebookSharedModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
    notebookRemovedFromTeam: (
      <NotebookRemovedModal
        open={!!modalAlert}
        onClose={() => setModalAlert(null)}
        alert={modalAlert}
      />
    ),
  };

  return modalAlert ? modals[modalAlert?.type] : null;
};

export default ModalAlertElement;
