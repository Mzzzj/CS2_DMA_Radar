package cs2.dma.main;

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
        List<PlayerInfo> list=gameDataManager.getPlayerInfoList();
        gameData.put("playerList",list);
        gameData.put("mapName","dust2");
        gameData.put("time",new Date().getTime()-time.getTime());
        return gameData.toJSONString();
    }
}
