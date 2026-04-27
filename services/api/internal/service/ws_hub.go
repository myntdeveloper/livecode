package service

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type roomUserProfile struct {
	Name      string `json:"name,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type roomCursor struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}

type roomWSMessage struct {
	Type         string                     `json:"type"`
	UserID       string                     `json:"user_id,omitempty"`
	TargetUserID string                     `json:"target_user_id,omitempty"`
	Code         string                     `json:"code,omitempty"`
	Language     string                     `json:"language,omitempty"`
	Users        []string                   `json:"users,omitempty"`
	Output       string                     `json:"output,omitempty"`
	IsError      bool                       `json:"is_error,omitempty"`
	Line         int                        `json:"line,omitempty"`
	Column       int                        `json:"column,omitempty"`
	Profiles     map[string]roomUserProfile `json:"profiles,omitempty"`
	Cursors      map[string]roomCursor      `json:"cursors,omitempty"`
	Name         string                     `json:"name,omitempty"`
	AvatarURL    string                     `json:"avatar_url,omitempty"`
}

type roomClient struct {
	userID string
	conn   *websocket.Conn
	roomID string
}

var (
	roomClientsMu sync.Mutex
	roomClients   = map[string]map[*roomClient]struct{}{}
	roomCodeState = map[string]string{}
	roomLangState = map[string]string{}
	roomOwnerID   = map[string]string{}
	roomProfiles  = map[string]map[string]roomUserProfile{}
	roomCursors   = map[string]map[string]roomCursor{}
	roomOutput    = map[string]string{}
)

func JoinRoomHub(roomID string, ownerID string, userID string, conn *websocket.Conn) {
	_ = conn.SetReadDeadline(time.Now().Add(70 * time.Second))
	conn.SetPongHandler(func(string) error {
		_ = conn.SetReadDeadline(time.Now().Add(70 * time.Second))
		return nil
	})

	client := &roomClient{
		userID: userID,
		conn:   conn,
		roomID: roomID,
	}

	roomClientsMu.Lock()
	if roomClients[roomID] == nil {
		roomClients[roomID] = map[*roomClient]struct{}{}
	}
	if roomOwnerID[roomID] == "" {
		roomOwnerID[roomID] = ownerID
	}
	if roomProfiles[roomID] == nil {
		roomProfiles[roomID] = map[string]roomUserProfile{}
	}
	if roomCursors[roomID] == nil {
		roomCursors[roomID] = map[string]roomCursor{}
	}
	roomClients[roomID][client] = struct{}{}
	clients := copyRoomClientsLocked(roomID)
	code := roomCodeState[roomID]
	lang := roomLangState[roomID]
	output := roomOutput[roomID]
	profiles := copyProfilesLocked(roomID)
	cursors := copyCursorsLocked(roomID)
	roomClientsMu.Unlock()

	broadcast(roomID, roomWSMessage{
		Type:     "presence",
		Users:    collectUsers(clients),
		UserID:   userID,
		Profiles: profiles,
		Cursors:  cursors,
	})

	if code != "" {
		_ = conn.WriteJSON(roomWSMessage{Type: "code_sync", Code: code})
	}
	if lang != "" {
		_ = conn.WriteJSON(roomWSMessage{Type: "language_sync", Language: lang})
	}
	if output != "" {
		_ = conn.WriteJSON(roomWSMessage{Type: "run_output", Output: output})
	}

	go pingClient(conn)

	for {
		_, payload, err := conn.ReadMessage()
		if err != nil {
			removeClient(client)
			return
		}

		var msg roomWSMessage
		if err := json.Unmarshal(payload, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "code_change":
			roomClientsMu.Lock()
			roomCodeState[roomID] = msg.Code
			roomClientsMu.Unlock()
			broadcastExcept(roomID, client, roomWSMessage{
				Type:   "code_sync",
				UserID: userID,
				Code:   msg.Code,
			})
		case "language_change":
			roomClientsMu.Lock()
			roomLangState[roomID] = msg.Language
			roomClientsMu.Unlock()
			broadcastExcept(roomID, client, roomWSMessage{
				Type:     "language_sync",
				UserID:   userID,
				Language: msg.Language,
			})
		case "run_output":
			roomClientsMu.Lock()
			roomOutput[roomID] = msg.Output
			roomClientsMu.Unlock()
			broadcast(roomID, roomWSMessage{
				Type:    "run_output",
				UserID:  userID,
				Output:  msg.Output,
				IsError: msg.IsError,
			})
		case "profile":
			roomClientsMu.Lock()
			roomProfiles[roomID][userID] = roomUserProfile{
				Name:      msg.Name,
				AvatarURL: msg.AvatarURL,
			}
			clients = copyRoomClientsLocked(roomID)
			profiles = copyProfilesLocked(roomID)
			cursors = copyCursorsLocked(roomID)
			roomClientsMu.Unlock()
			broadcast(roomID, roomWSMessage{
				Type:     "presence",
				Users:    collectUsers(clients),
				UserID:   userID,
				Profiles: profiles,
				Cursors:  cursors,
			})
		case "cursor_change":
			roomClientsMu.Lock()
			roomCursors[roomID][userID] = roomCursor{
				Line:   msg.Line,
				Column: msg.Column,
			}
			roomClientsMu.Unlock()
			broadcastExcept(roomID, client, roomWSMessage{
				Type:   "cursor_sync",
				UserID: userID,
				Line:   msg.Line,
				Column: msg.Column,
			})
		case "ping":
			_ = conn.WriteJSON(roomWSMessage{Type: "pong"})
		case "kick":
			roomClientsMu.Lock()
			owner := roomOwnerID[roomID]
			target := findClientByUserIDLocked(roomID, msg.TargetUserID)
			roomClientsMu.Unlock()

			if owner != userID || target == nil || msg.TargetUserID == "" {
				continue
			}

			_ = target.conn.WriteJSON(roomWSMessage{
				Type:         "kicked",
				UserID:       userID,
				TargetUserID: msg.TargetUserID,
			})
			removeClient(target)
		}
	}
}

func removeClient(client *roomClient) {
	roomClientsMu.Lock()
	clients := roomClients[client.roomID]
	delete(clients, client)
	if len(clients) == 0 {
		delete(roomClients, client.roomID)
		delete(roomCodeState, client.roomID)
		delete(roomLangState, client.roomID)
		delete(roomOwnerID, client.roomID)
		delete(roomProfiles, client.roomID)
		delete(roomCursors, client.roomID)
		delete(roomOutput, client.roomID)
	} else {
		delete(roomProfiles[client.roomID], client.userID)
		delete(roomCursors[client.roomID], client.userID)
	}
	remaining := copyRoomClientsLocked(client.roomID)
	profiles := copyProfilesLocked(client.roomID)
	cursors := copyCursorsLocked(client.roomID)
	roomClientsMu.Unlock()

	_ = client.conn.Close()

	broadcast(client.roomID, roomWSMessage{
		Type:     "presence",
		Users:    collectUsers(remaining),
		UserID:   client.userID,
		Profiles: profiles,
		Cursors:  cursors,
	})
}

func copyRoomClientsLocked(roomID string) []*roomClient {
	clients := roomClients[roomID]
	result := make([]*roomClient, 0, len(clients))
	for client := range clients {
		result = append(result, client)
	}
	return result
}

func findClientByUserIDLocked(roomID string, userID string) *roomClient {
	if userID == "" {
		return nil
	}
	for client := range roomClients[roomID] {
		if client.userID == userID {
			return client
		}
	}
	return nil
}

func copyProfilesLocked(roomID string) map[string]roomUserProfile {
	source := roomProfiles[roomID]
	result := make(map[string]roomUserProfile, len(source))
	for userID, profile := range source {
		result[userID] = profile
	}
	return result
}

func copyCursorsLocked(roomID string) map[string]roomCursor {
	source := roomCursors[roomID]
	result := make(map[string]roomCursor, len(source))
	for userID, cursor := range source {
		result[userID] = cursor
	}
	return result
}

func collectUsers(clients []*roomClient) []string {
	users := make([]string, 0, len(clients))
	seen := map[string]struct{}{}
	for _, client := range clients {
		if _, ok := seen[client.userID]; ok {
			continue
		}
		seen[client.userID] = struct{}{}
		users = append(users, client.userID)
	}
	return users
}

func broadcast(roomID string, message roomWSMessage) {
	broadcastExcept(roomID, nil, message)
}

func broadcastExcept(roomID string, excluded *roomClient, message roomWSMessage) {
	roomClientsMu.Lock()
	clients := copyRoomClientsLocked(roomID)
	roomClientsMu.Unlock()

	for _, client := range clients {
		if excluded != nil && client == excluded {
			continue
		}
		_ = client.conn.WriteJSON(message)
	}
}

func CloseRoomHub(roomID string) {
	roomClientsMu.Lock()
	clients := copyRoomClientsLocked(roomID)
	delete(roomClients, roomID)
	delete(roomCodeState, roomID)
	delete(roomLangState, roomID)
	delete(roomOwnerID, roomID)
	delete(roomProfiles, roomID)
	delete(roomCursors, roomID)
	delete(roomOutput, roomID)
	roomClientsMu.Unlock()

	for _, client := range clients {
		_ = client.conn.WriteJSON(roomWSMessage{Type: "room_closed"})
		_ = client.conn.Close()
	}
}

func pingClient(conn *websocket.Conn) {
	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		if err := conn.WriteControl(websocket.PingMessage, []byte("ping"), time.Now().Add(5*time.Second)); err != nil {
			return
		}
	}
}
