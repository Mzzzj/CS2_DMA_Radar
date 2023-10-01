package cs.entry;

public class PlayerInfo {
    private long addRddress;
    private int teamId;
    private int health;
    private int armor;
    private boolean isAlive;
    private boolean isLocalPlayer;
    private boolean isEnemy;
    private  float x;
    private  float y;
    private  float z;
    private  float Angles;

    public PlayerInfo(long addRddress,int teamId, int health, int armor, boolean isAlive, boolean isLocalPlayer, boolean isEnemy, float x, float y, float z, float angles) {
        this.addRddress = addRddress;
        this.teamId = teamId;
        this.health = health;
        this.armor = armor;
        this.isAlive = isAlive;
        this.isLocalPlayer = isLocalPlayer;
        this.isEnemy = isEnemy;
        this.x = x;
        this.y = y;
        this.z = z;
        Angles = angles;
    }

    public long getAddRddress() {
        return addRddress;
    }

    public void setAddRddress(long addRddress) {
        this.addRddress = addRddress;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public int getArmor() {
        return armor;
    }

    public void setArmor(int armor) {
        this.armor = armor;
    }

    public boolean isAlive() {
        return isAlive;
    }

    public void setAlive(boolean alive) {
        isAlive = alive;
    }

    public boolean isLocalPlayer() {
        return isLocalPlayer;
    }

    public void setLocalPlayer(boolean localPlayer) {
        isLocalPlayer = localPlayer;
    }

    public boolean isEnemy() {
        return isEnemy;
    }

    public void setEnemy(boolean enemy) {
        isEnemy = enemy;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getZ() {
        return z;
    }

    public void setZ(float z) {
        this.z = z;
    }

    public float getAngles() {
        return Angles;
    }

    public void setAngles(float angles) {
        Angles = angles;
    }
}
