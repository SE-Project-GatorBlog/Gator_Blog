package redis

import (
	"context"
	"log"
	"time"

	"encoding/json"
	// "time"

	"github.com/go-redis/redis/v8"
)

var (
	RedisClient *redis.Client
	Ctx         = context.Background()
)

// function to initialise redis connection
func InitRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})
	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		panic("Failed to connect to Redis: " + err.Error())
	}
	log.Println("Redis successfull")
}

// function to store data in Redis
func SetCache(key string, value interface{}, expiration time.Duration) error {
	json, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return RedisClient.Set(Ctx, key, json, expiration).Err()
}

// function to retrieve data from Redis
func GetCache(key string, dest interface{}) (bool, error) {
	val, err := RedisClient.Get(Ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}
	err = json.Unmarshal([]byte(val), dest)
	if err != nil {
		return false, err
	}
	return true, nil

}

// function to delete a key from cache
func DeleteCache(key string) error {
	return RedisClient.Del(Ctx, key).Err()
}
