package cs.radar;

import cs.tuil.GameDataManager;

import java.net.UnknownHostException;

public class Main {
    public static void main(String[] args) throws UnknownHostException {
        GameDataManager manager=new GameDataManager();
        if(manager.initializeVmm()){
            //初始化完成
            if(  manager.initializeGameData()){
                //获取游戏数据
                int port = 8800; // 843 flash policy port

                SocketServer s = new SocketServer(port);
                s.setGameDataManager(manager);
                s.start();
                System.out.println("ChatServer started on port: " + s.getPort());

            }
        }

    }
}