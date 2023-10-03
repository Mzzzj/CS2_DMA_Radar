package cs2.dma.main;

import ch.qos.logback.core.model.Model;
import com.alibaba.fastjson.JSONObject;
import cs2.dma.entry.PlayerInfo;
import cs2.dma.tuil.GameDataManager;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;

@RestController
public class GmaeDataController {

    private static GameDataManager gameDataManager;

    public static void setGameDataManager(GameDataManager gameDataManager) {
        GmaeDataController.gameDataManager = gameDataManager;
    }
    @RequestMapping("/getGameData")
    public String getGameData(){
        Date time=new Date();
        JSONObject gameData=new JSONObject();
        gameDataManager.initPlayerInfo();
        String mapName=gameDataManager.getMapName();
        if("<empty>".equals(mapName)||"".equals(mapName)||mapName==null){
            return "";
        }
        List<PlayerInfo> list=gameDataManager.getPlayerInfoList();
        gameData.put("playerList",list);
        gameData.put("mapName",mapName);
        gameData.put("tick",new Date().getTime()-time.getTime());
        return gameData.toJSONString();
    }

}
