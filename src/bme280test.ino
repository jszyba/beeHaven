#include "Adafruit_Sensor.h"
#include "Adafruit_BME280.h"

#define BME_SCK D4
#define BME_MISO D3
#define BME_MOSI D2

#define BME_CS_INTERNAL D5
#define BME_CS_EXTERNAL D1

#define SEALEVELPRESSURE_HPA (1013.25)

int led = D7;
char envData[128];

//Adafruit_BME280 bme; // I2C (D0, D1, GRND, 3.3)
//Adafruit_BME280 bmeInternal(BME_CS_INTERNAL); // hardware SPI
//Adafruit_BME280 bmeExternal(BME_CS_EXTERNAL); // hardware SPI
Adafruit_BME280 bmeInternal(BME_CS_INTERNAL, BME_MOSI, BME_MISO, BME_SCK); // software SPI
Adafruit_BME280 bmeExternal(BME_CS_EXTERNAL, BME_MOSI, BME_MISO, BME_SCK); // software SPI

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
  Serial.println(F("Starting BME280 pings..."));
  if (!bmeInternal.begin() || !bmeExternal.begin()) {
    Serial.println("Could not find a valid bme sensor, check wiring!");
    while (1) {
      Serial.println("broken...");
      delay(1000);
    }
  }
  Particle.variable("envData", envData);
}

void loop() {
    digitalWrite(led, HIGH);

    float intTemp, extTemp, intPressure, extPressure, intAltitude, extAltitude, intHumidity, extHumidity = 0.0F;

    intTemp = (bmeInternal.readTemperature() * 1.8F) + 32;
    extTemp = (bmeExternal.readTemperature() * 1.8F) + 32;

    intPressure = bmeInternal.readPressure() / 100.0F;
    extPressure = bmeExternal.readPressure() / 100.0F;

    intAltitude = bmeInternal.readAltitude(SEALEVELPRESSURE_HPA);
    extAltitude = bmeExternal.readAltitude(SEALEVELPRESSURE_HPA);

    intHumidity = bmeInternal.readHumidity();
    extHumidity = bmeExternal.readHumidity();

    /*Serial.println("internal temperature: " + String(intTemp) + "°F");
    Serial.println("external temperature: " + String(extTemp) + "°F");

    Serial.println("internal pressure: " + String(intPressure) + "hPa");
    Serial.println("external pressure: " + String(extPressure) + "hPa");

    Serial.println("internal altitude: " + String(intAltitude) + "m");
    Serial.println("external altitude: " + String(extAltitude) + "m");

    Serial.println("internal humidity: " + String(intHumidity) + "%");
    Serial.println("external humidity: " + String(extHumidity) + "%");*/

    sprintf(envData, "{\"iT\": %.2f, \"iP\": %.2f, \"iA\": %.2f, \"iH\": %.2f, \"eT\": %.2f, \"eP\": %.2f, \"eA\": %.2f, \"eH\": %.2f}",
                                            intTemp, intPressure, intAltitude, intHumidity, extTemp, extPressure, extAltitude, extHumidity);
    Serial.println(String(envData));

    Particle.publish("envData", String(envData));
    delay(10000);
    digitalWrite(led, LOW);
    delay(300000);
}
