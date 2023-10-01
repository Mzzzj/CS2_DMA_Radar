package cs.radar;

import com.alibaba.fastjson.JSONObject;
import cs.tuil.GameDataManager;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;

public class SocketServer extends WebSocketServer {

    private GameDataManager gameDataManager;

    public GameDataManager getGameDataManager() {
        return gameDataManager;
    }

    public void setGameDataManager(GameDataManager gameDataManager) {
        this.gameDataManager = gameDataManager;
    }

    public SocketServer(int port) throws UnknownHostException {
        super(new InetSocketAddress(port));
    }

    public SocketServer(InetSocketAddress address) {
        super(address);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("已建立连接");

    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println(conn + " has left the room!");
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        System.out.println(conn + ": " + message);
        gameDataManager.updatePlayerInfo();
        JSONObject gameData=new JSONObject();
        gameData.put("playerList",gameDataManager.getPlayerInfoList());
        gameData.put("mapName","dust2");
        broadcast( gameData.toJSONString());
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        ex.printStackTrace();
        if (conn != null) {
            // some errors like port binding failed may not be assignable to a specific
            // websocket
        }

    }

    @Override
    public void onStart() {
        System.out.println("Server started!");
        setConnectionLostTimeout(0);
        setConnectionLostTimeout(100);

    }

}
