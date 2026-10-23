import { useState } from 'react';
import { useFriends, useFriendRequests, useSendFriendRequestMutation, useRespondToFriendRequestMutation, useRemoveFriendMutation } from '../../../shared/api/hooks';
import { AppShell } from '../../../shared/layout/AppShell';
import { EmptyState } from '../../../shared/components/EmptyState';
import { loadingScreen } from '../../../shared/design-system/layout';
import { getApiErrorMessage } from '../../../shared/api/get-api-error-message';
import type { Friend, FriendRequest } from '../../../shared/api/validators';
import '../../dashboard/DashboardPage.css';

export function FriendsPage() {
  const { data: friends, isLoading: friendsLoading } = useFriends();
  const { data: friendRequests, isLoading: requestsLoading } = useFriendRequests();
  const sendRequestMutation = useSendFriendRequestMutation();
  const respondMutation = useRespondToFriendRequestMutation();
  const removeMutation = useRemoveFriendMutation();
  const [userIdInput, setUserIdInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [removeTarget, setRemoveTarget] = useState<Friend | null>(null);

  const friendsList = (friends ?? []) as Friend[];
  const requestsList = (friendRequests ?? []) as FriendRequest[];

  if (friendsLoading || requestsLoading) {
    return <AppShell title="Amigos" subtitle="Gestiona tus amigos."><div className={loadingScreen}>Cargando amigos...</div></AppShell>;
  }

  const handleSendRequest = async () => {
    if (!userIdInput.trim()) return;
    try {
      await sendRequestMutation.mutateAsync(userIdInput.trim());
      setFeedback('Solicitud enviada correctamente.');
      setUserIdInput('');
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No se pudo enviar la solicitud.'));
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    await removeMutation.mutateAsync(removeTarget._id);
    setFeedback(`${removeTarget.fullName} se eliminó de tus amigos.`);
    setRemoveTarget(null);
  };

  return (
    <AppShell title="Amigos" subtitle="Conecta con las personas que comparten tu interés por invertir.">
      <section className="quill-friends-page">
        <span className="quill-eyebrow">Tu comunidad</span>
        <header className="quill-page-header"><div><h2>Amigos</h2><p>Conecta con las personas que comparten tu interés por invertir.</p></div><button type="button" className="quill-primary-action" onClick={() => document.getElementById('friend-search')?.focus()}>+ Agregar amigo</button></header>
        <section className="quill-friend-search"><label htmlFor="friend-search">Buscar por nombre de usuario</label><div><input id="friend-search" value={userIdInput} onChange={(event) => setUserIdInput(event.target.value)} placeholder="Ej.: camila.rojas" /><button type="button" onClick={() => void handleSendRequest()} disabled={!userIdInput.trim() || sendRequestMutation.isPending}>Buscar</button></div></section>
        <div className="quill-page-tabs" role="tablist" aria-label="Amigos y solicitudes"><button type="button" role="tab" aria-selected={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>Mis amigos {friendsList.length}</button><button type="button" role="tab" aria-selected={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>Solicitudes {requestsList.length}</button></div>
        {activeTab === 'friends' ? (friendsList.length ? <div className="quill-friend-grid">{friendsList.map((friend) => <article key={friend._id} className="quill-friend-card"><div className="quill-friend-person"><span>{friend.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>{friend.fullName}</strong><small>@{friend.username ?? friend.email.split('@')[0]}</small></div></div><p>En tu lista de amigos</p><footer><button type="button" onClick={() => setRemoveTarget(friend)}>Eliminar amigo</button></footer></article>)}</div> : <EmptyState title="Sin amigos" description="Envía solicitudes a otros usuarios para empezar." />) : (requestsList.length ? <div className="quill-friend-grid">{requestsList.map((request) => <article key={request._id} className="quill-friend-card"><div className="quill-friend-person"><span>{request.from.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>{request.from.fullName}</strong><small>@{request.from.username ?? request.from.email.split('@')[0]}</small></div></div><p>Quiere agregarte a sus amigos</p><footer><button type="button" onClick={() => void respondMutation.mutateAsync({ userId: request.from._id, data: { status: 'accepted' } })}>Aceptar solicitud</button></footer></article>)}</div> : <EmptyState title="Sin solicitudes" description="No tienes solicitudes pendientes." />)}
        {removeTarget ? <section className="quill-unfriend"><p>¿Eliminar a {removeTarget.fullName} de tus amigos?</p><div><button type="button" onClick={() => void confirmRemove()} disabled={removeMutation.isPending}>Eliminar amigo</button><button type="button" onClick={() => setRemoveTarget(null)}>Conservar</button></div></section> : null}
        {feedback ? <p className="quill-feedback">{feedback}</p> : null}
        <p className="quill-page-note">Agregar a alguien no comparte tu saldo ni realiza operaciones en tu cuenta.</p>
      </section>
    </AppShell>
  );
}
