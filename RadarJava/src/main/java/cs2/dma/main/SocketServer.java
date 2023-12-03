package cs2.dma.main;

import com.alibaba.fastjson.JSONObject;
import cs2.dma.entry.PlayerInfo;
import cs2.dma.tuil.GameDataManager;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Date;
import java.util.List;

public class SocketServer extends WebSocketServer {

    private static GameDataManager gameDataManager;

    private boolean startSend=false;


    public SocketServer(int port,GameDataManager gameDataManager) throws UnknownHostException {
        super(new InetSocketAddress(port));
        SocketServer.gameDataManager=gameDataManager;
    }

    public SocketServer(InetSocketAddress address) {
        super(address);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
       this.startSend=true;

    }
    public  void sendMsg() throws InterruptedException {
        while (true)
        {
            if(this.startSend){
                broadcast(getGameData());
            }
            Thread.sleep(1);
        }
    }
    public String getGameData(){
        Date time=new Date();
        JSONObject gameData=new JSONObject();
        if(gameDataManager!=null){
            gameDataManager.initPlayerInfo();
            String mapName=gameDataManager.getMapName();
            if("<empty>".equals(mapName)||"".equals(mapName)||mapName==null){
                return "";
            }
            List<PlayerInfo> list=gameDataManager.getPlayerInfoList();
            gameData.put("playerList",list);
            gameData.put("mapName",mapName);
        }

        gameData.put("tick",new Date().getTime()-time.getTime());
        return gameData.toJSONString();
    }
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {

        this.startSend=false;

    }

    @Override
    public void onMessage(WebSocket conn, String message) {

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
        setConnectionLostTimeout(0);
        setConnectionLostTimeout(100);

    }

}
