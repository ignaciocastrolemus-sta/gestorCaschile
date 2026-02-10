SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'XV')
    UPDATE Regiones SET Nombre = N'Arica y Parinacota', Romano = N'XV' WHERE Romano = N'XV';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Arica y Parinacota')
    UPDATE Regiones SET Romano = N'XV' WHERE Nombre = N'Arica y Parinacota';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Arica y Parinacota', N'XV');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'I')
    UPDATE Regiones SET Nombre = N'Tarapacá', Romano = N'I' WHERE Romano = N'I';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá')
    UPDATE Regiones SET Romano = N'I' WHERE Nombre = N'Tarapacá';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Tarapacá', N'I');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'II')
    UPDATE Regiones SET Nombre = N'Antofagasta', Romano = N'II' WHERE Romano = N'II';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta')
    UPDATE Regiones SET Romano = N'II' WHERE Nombre = N'Antofagasta';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Antofagasta', N'II');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'III')
    UPDATE Regiones SET Nombre = N'Atacama', Romano = N'III' WHERE Romano = N'III';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama')
    UPDATE Regiones SET Romano = N'III' WHERE Nombre = N'Atacama';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Atacama', N'III');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'IV')
    UPDATE Regiones SET Nombre = N'Coquimbo', Romano = N'IV' WHERE Romano = N'IV';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo')
    UPDATE Regiones SET Romano = N'IV' WHERE Nombre = N'Coquimbo';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Coquimbo', N'IV');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'V')
    UPDATE Regiones SET Nombre = N'Valparaíso', Romano = N'V' WHERE Romano = N'V';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso')
    UPDATE Regiones SET Romano = N'V' WHERE Nombre = N'Valparaíso';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Valparaíso', N'V');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'RM')
    UPDATE Regiones SET Nombre = N'Metropolitana de Santiago', Romano = N'RM' WHERE Romano = N'RM';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago')
    UPDATE Regiones SET Romano = N'RM' WHERE Nombre = N'Metropolitana de Santiago';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Metropolitana de Santiago', N'RM');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'VI')
    UPDATE Regiones SET Nombre = N'Libertador General Bernardo O''Higgins', Romano = N'VI' WHERE Romano = N'VI';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins')
    UPDATE Regiones SET Romano = N'VI' WHERE Nombre = N'Libertador General Bernardo O''Higgins';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Libertador General Bernardo O''Higgins', N'VI');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'VII')
    UPDATE Regiones SET Nombre = N'Maule', Romano = N'VII' WHERE Romano = N'VII';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule')
    UPDATE Regiones SET Romano = N'VII' WHERE Nombre = N'Maule';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Maule', N'VII');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'XVI')
    UPDATE Regiones SET Nombre = N'Ñuble', Romano = N'XVI' WHERE Romano = N'XVI';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble')
    UPDATE Regiones SET Romano = N'XVI' WHERE Nombre = N'Ñuble';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Ñuble', N'XVI');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'VIII')
    UPDATE Regiones SET Nombre = N'Biobío', Romano = N'VIII' WHERE Romano = N'VIII';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío')
    UPDATE Regiones SET Romano = N'VIII' WHERE Nombre = N'Biobío';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Biobío', N'VIII');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'IX')
    UPDATE Regiones SET Nombre = N'La Araucanía', Romano = N'IX' WHERE Romano = N'IX';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía')
    UPDATE Regiones SET Romano = N'IX' WHERE Nombre = N'La Araucanía';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'La Araucanía', N'IX');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'XIV')
    UPDATE Regiones SET Nombre = N'Los Ríos', Romano = N'XIV' WHERE Romano = N'XIV';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos')
    UPDATE Regiones SET Romano = N'XIV' WHERE Nombre = N'Los Ríos';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Los Ríos', N'XIV');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'X')
    UPDATE Regiones SET Nombre = N'Los Lagos', Romano = N'X' WHERE Romano = N'X';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos')
    UPDATE Regiones SET Romano = N'X' WHERE Nombre = N'Los Lagos';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Los Lagos', N'X');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'XI')
    UPDATE Regiones SET Nombre = N'Aysén del General Carlos Ibáñez del Campo', Romano = N'XI' WHERE Romano = N'XI';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo')
    UPDATE Regiones SET Romano = N'XI' WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Aysén del General Carlos Ibáñez del Campo', N'XI');

IF EXISTS (SELECT 1 FROM Regiones WHERE Romano = N'XII')
    UPDATE Regiones SET Nombre = N'Magallanes y de la Antártica Chilena', Romano = N'XII' WHERE Romano = N'XII';
ELSE IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena')
    UPDATE Regiones SET Romano = N'XII' WHERE Nombre = N'Magallanes y de la Antártica Chilena';
ELSE
    INSERT INTO Regiones (Nombre, Romano) VALUES (N'Magallanes y de la Antártica Chilena', N'XII');

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Serena')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Serena', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coquimbo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coquimbo', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Andacollo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Andacollo', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Higuera')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Higuera', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Paiguano')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Paiguano', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vicuna')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vicuna', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Illapel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Illapel', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Canela')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Canela', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Vilos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Vilos', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Salamanca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Salamanca', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ovalle')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ovalle', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Combarbala')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Combarbala', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Monte Patria')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Monte Patria', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Punitaqui')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Punitaqui', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Coquimbo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Hurtado')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Hurtado', Id FROM Regiones WHERE Nombre = N'Coquimbo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chillan')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chillan', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Bulnes')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Bulnes', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chillan Viejo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chillan Viejo', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'El Carmen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'El Carmen', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pemuco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pemuco', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pinto')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pinto', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quillon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quillon', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Ignacio')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Ignacio', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Yungay')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Yungay', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cobquecura')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cobquecura', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coelemu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coelemu', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ninhue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ninhue', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Portezuelo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Portezuelo', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quirihue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quirihue', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ranquil')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ranquil', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Treguaco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Treguaco', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Carlos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Carlos', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coihueco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coihueco', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Niquen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Niquen', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Fabian')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Fabian', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Ñuble') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Nicolas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Nicolas', Id FROM Regiones WHERE Nombre = N'Ñuble';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coyhaique')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coyhaique', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lago Verde')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lago Verde', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Aysen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Aysen', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cisnes')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cisnes', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Guaitecas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Guaitecas', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cochrane')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cochrane', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'O''Higgins')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'O''Higgins', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tortel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tortel', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chile Chico')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chile Chico', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Ibanez')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Ibanez', Id FROM Regiones WHERE Nombre = N'Aysén del General Carlos Ibáñez del Campo';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Temuco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Temuco', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Carahue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Carahue', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cunco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cunco', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curarrehue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curarrehue', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Freire')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Freire', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Galvarino')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Galvarino', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Gorbea')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Gorbea', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lautaro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lautaro', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Loncoche')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Loncoche', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Melipeuco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Melipeuco', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Nueva Imperial')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Nueva Imperial', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Padre Las Casas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Padre Las Casas', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Perquenco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Perquenco', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pitrufquen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pitrufquen', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pucon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pucon', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Saavedra')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Saavedra', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Teodoro Schmidt')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Teodoro Schmidt', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tolten')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tolten', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vilcun')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vilcun', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Villarrica')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Villarrica', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cholchol')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cholchol', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Angol')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Angol', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Collipulli')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Collipulli', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curacautin')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curacautin', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ercilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ercilla', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lonquimay')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lonquimay', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Sauces')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Sauces', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lumaco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lumaco', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puren')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puren', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Renaico')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Renaico', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Traiguen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Traiguen', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'La Araucanía') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Victoria')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Victoria', Id FROM Regiones WHERE Nombre = N'La Araucanía';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rancagua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rancagua', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Codegua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Codegua', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coinco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coinco', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coltauco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coltauco', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Donihue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Donihue', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Graneros')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Graneros', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Las Cabras')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Las Cabras', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Machali')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Machali', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Malloa')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Malloa', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Mostazal')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Mostazal', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Olivar')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Olivar', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Peumo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Peumo', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pichidegua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pichidegua', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quinta de Tilcoco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quinta de Tilcoco', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rengo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rengo', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Requinoa')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Requinoa', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Vicente')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Vicente', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pichilemu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pichilemu', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Estrella')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Estrella', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Litueche')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Litueche', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Marchigue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Marchigue', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Navidad')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Navidad', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Paredones')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Paredones', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Fernando')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Fernando', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chepica')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chepica', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chimbarongo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chimbarongo', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lolol')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lolol', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Nancagua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Nancagua', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Palmilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Palmilla', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Peralillo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Peralillo', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Placilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Placilla', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pumanque')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pumanque', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santa Cruz')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santa Cruz', Id FROM Regiones WHERE Nombre = N'Libertador General Bernardo O''Higgins';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puerto Montt')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puerto Montt', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Calbuco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Calbuco', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cochamo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cochamo', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Fresia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Fresia', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Frutillar')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Frutillar', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Muermos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Muermos', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Llanquihue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Llanquihue', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Maullin')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Maullin', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puerto Varas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puerto Varas', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Castro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Castro', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ancud')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ancud', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chonchi')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chonchi', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curaco de Velez')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curaco de Velez', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Dalcahue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Dalcahue', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puqueldon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puqueldon', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Queilen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Queilen', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quellon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quellon', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quemchi')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quemchi', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quinchao')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quinchao', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Osorno')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Osorno', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puerto Octay')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puerto Octay', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Purranque')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Purranque', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puyehue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puyehue', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Negro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Negro', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Juan de la Costa')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Juan de la Costa', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Pablo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Pablo', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chaiten')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chaiten', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Futaleufu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Futaleufu', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Hualaihue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Hualaihue', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Lagos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Palena')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Palena', Id FROM Regiones WHERE Nombre = N'Los Lagos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Antofagasta')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Antofagasta', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Mejillones')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Mejillones', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Sierra Gorda')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Sierra Gorda', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Taltal')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Taltal', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Calama')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Calama', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Ollague')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Ollague', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Pedro de Atacama')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Pedro de Atacama', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tocopilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tocopilla', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Antofagasta') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Maria Elena')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Maria Elena', Id FROM Regiones WHERE Nombre = N'Antofagasta';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Talca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Talca', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Constitucion')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Constitucion', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curepto')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curepto', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Empedrado')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Empedrado', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Maule')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Maule', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pelarco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pelarco', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pencahue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pencahue', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Claro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Claro', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Clemente')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Clemente', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Rafael')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Rafael', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cauquenes')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cauquenes', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chanco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chanco', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pelluhue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pelluhue', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curico')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curico', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Hualane')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Hualane', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Licanten')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Licanten', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Molina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Molina', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rauco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rauco', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Romeral')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Romeral', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Sagrada Familia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Sagrada Familia', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Teno')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Teno', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vichuquen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vichuquen', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Linares')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Linares', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Colbun')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Colbun', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Longavi')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Longavi', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Parral')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Parral', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Retiro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Retiro', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Javier')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Javier', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Villa Alegre')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Villa Alegre', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Maule') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Yerbas Buenas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Yerbas Buenas', Id FROM Regiones WHERE Nombre = N'Maule';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Copiapo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Copiapo', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Caldera')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Caldera', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tierra Amarilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tierra Amarilla', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chanaral')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chanaral', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Diego de Almagro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Diego de Almagro', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vallenar')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vallenar', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Alto del Carmen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Alto del Carmen', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Freirina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Freirina', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Atacama') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Huasco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Huasco', Id FROM Regiones WHERE Nombre = N'Atacama';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Iquique')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Iquique', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Alto Hospicio')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Alto Hospicio', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pozo Almonte')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pozo Almonte', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Camina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Camina', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Colchane')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Colchane', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Huara')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Huara', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Tarapacá') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pica')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pica', Id FROM Regiones WHERE Nombre = N'Tarapacá';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Concepcion')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Concepcion', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Coronel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Coronel', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Chiguayante')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Chiguayante', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Florida')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Florida', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Hualqui')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Hualqui', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lota')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lota', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Penco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Penco', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Pedro de la Paz')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Pedro de la Paz', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santa Juana')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santa Juana', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Talcahuano')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Talcahuano', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tome')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tome', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Hualpen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Hualpen', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lebu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lebu', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Arauco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Arauco', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Canete')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Canete', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Contulmo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Contulmo', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curanilahue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curanilahue', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Alamos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Alamos', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tirua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tirua', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Angeles')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Angeles', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Antuco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Antuco', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cabrero')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cabrero', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Laja')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Laja', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Mulchen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Mulchen', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Nacimiento')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Nacimiento', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Negrete')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Negrete', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quilaco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quilaco', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quilleco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quilleco', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Rosendo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Rosendo', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santa Barbara')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santa Barbara', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tucapel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tucapel', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Yumbel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Yumbel', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Biobío') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Alto Biobio')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Alto Biobio', Id FROM Regiones WHERE Nombre = N'Biobío';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Arica y Parinacota') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Arica')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Arica', Id FROM Regiones WHERE Nombre = N'Arica y Parinacota';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Arica y Parinacota') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Camarones')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Camarones', Id FROM Regiones WHERE Nombre = N'Arica y Parinacota';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Arica y Parinacota') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Putre')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Putre', Id FROM Regiones WHERE Nombre = N'Arica y Parinacota';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Arica y Parinacota') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'General Lagos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'General Lagos', Id FROM Regiones WHERE Nombre = N'Arica y Parinacota';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Valparaiso')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Valparaiso', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Casablanca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Casablanca', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Concon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Concon', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Juan Fernandez')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Juan Fernandez', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puchuncavi')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puchuncavi', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quintero')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quintero', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vina del Mar')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vina del Mar', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Isla de Pascua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Isla de Pascua', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Andes')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Andes', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Calle Larga')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Calle Larga', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rinconada')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rinconada', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Esteban')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Esteban', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Ligua')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Ligua', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cabildo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cabildo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Papudo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Papudo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Petorca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Petorca', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Zapallar')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Zapallar', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quillota')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quillota', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Calera')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Calera', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Hijuelas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Hijuelas', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Cruz')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Cruz', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Nogales')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Nogales', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Antonio')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Antonio', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Algarrobo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Algarrobo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cartagena')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cartagena', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'El Quisco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'El Quisco', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'El Tabo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'El Tabo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santo Domingo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santo Domingo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Felipe')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Felipe', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Catemu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Catemu', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Llaillay')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Llaillay', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Panquehue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Panquehue', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Putaendo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Putaendo', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santa Maria')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santa Maria', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quilpue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quilpue', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Limache')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Limache', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Olmue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Olmue', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Valparaíso') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Villa Alemana')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Villa Alemana', Id FROM Regiones WHERE Nombre = N'Valparaíso';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Santiago')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Santiago', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cerrillos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cerrillos', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cerro Navia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cerro Navia', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Conchali')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Conchali', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'El Bosque')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'El Bosque', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Estacion Central')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Estacion Central', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Huechuraba')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Huechuraba', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Independencia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Independencia', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Cisterna')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Cisterna', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Florida')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Florida', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Granja')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Granja', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Pintana')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Pintana', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Reina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Reina', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Las Condes')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Las Condes', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lo Barnechea')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lo Barnechea', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lo Espejo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lo Espejo', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lo Prado')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lo Prado', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Macul')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Macul', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Maipu')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Maipu', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Nunoa')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Nunoa', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pedro Aguirre Cerda')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pedro Aguirre Cerda', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Penalolen')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Penalolen', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Providencia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Providencia', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pudahuel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pudahuel', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quilicura')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quilicura', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Quinta Normal')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Quinta Normal', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Recoleta')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Recoleta', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Renca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Renca', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Joaquin')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Joaquin', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Miguel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Miguel', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Ramon')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Ramon', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Vitacura')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Vitacura', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puente Alto')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puente Alto', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Pirque')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Pirque', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Jose de Maipo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Jose de Maipo', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Colina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Colina', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lampa')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lampa', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Tiltil')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Tiltil', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Bernardo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Bernardo', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Buin')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Buin', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Calera de Tango')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Calera de Tango', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Paine')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Paine', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Melipilla')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Melipilla', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Alhue')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Alhue', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Curacavi')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Curacavi', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Maria Pinto')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Maria Pinto', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Pedro')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Pedro', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Talagante')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Talagante', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'El Monte')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'El Monte', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Isla de Maipo')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Isla de Maipo', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Padre Hurtado')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Padre Hurtado', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Metropolitana de Santiago') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Penaflor')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Penaflor', Id FROM Regiones WHERE Nombre = N'Metropolitana de Santiago';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Valdivia')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Valdivia', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Corral')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Corral', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lanco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lanco', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Los Lagos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Los Lagos', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Mafil')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Mafil', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Mariquina')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Mariquina', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Paillaco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Paillaco', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Panguipulli')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Panguipulli', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'La Union')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'La Union', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Futrono')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Futrono', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Lago Ranco')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Lago Ranco', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Los Ríos') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Bueno')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Bueno', Id FROM Regiones WHERE Nombre = N'Los Ríos';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Punta Arenas')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Punta Arenas', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Laguna Blanca')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Laguna Blanca', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Rio Verde')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Rio Verde', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'San Gregorio')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'San Gregorio', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Cabo de Hornos')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Cabo de Hornos', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Antartica')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Antartica', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Porvenir')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Porvenir', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Primavera')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Primavera', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Timaukel')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Timaukel', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Puerto Natales')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Puerto Natales', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF EXISTS (SELECT 1 FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena') AND NOT EXISTS (SELECT 1 FROM Comunas WHERE Nombre = N'Torres del Paine')
    INSERT INTO Comunas (Nombre, RegionId)
    SELECT N'Torres del Paine', Id FROM Regiones WHERE Nombre = N'Magallanes y de la Antártica Chilena';

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Julio Eduardo Gonzalez Gomez')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Julio Eduardo Gonzalez Gomez');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Mario Ariel Munoz Soto')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Mario Ariel Munoz Soto');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Richard Antonio Tolorza Cerpa')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Richard Antonio Tolorza Cerpa');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Juan Carlos Barria Oyarzun')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Juan Carlos Barria Oyarzun');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Gerente de Operaciones')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Gerente de Operaciones');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Alejandro Eugenio Salinas Caceres')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Alejandro Eugenio Salinas Caceres');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Jefe de Proyecto')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Jefe de Proyecto');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Sebastian Enrique Vergara Olivos')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Sebastian Enrique Vergara Olivos');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'German Andres Rojas Albornoz')
    INSERT INTO Capacitadores (Nombre) VALUES (N'German Andres Rojas Albornoz');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Jefa de Mesa de Ayuda')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Jefa de Mesa de Ayuda');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Ingrid Grace Erazo Lobos')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Ingrid Grace Erazo Lobos');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Soporte en Terreno')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Soporte en Terreno');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Miguel Angel Caceres Gonzalez')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Miguel Angel Caceres Gonzalez');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Manuel Antonio Gonzalez Araya')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Manuel Antonio Gonzalez Araya');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Pedro Fernando Chavez Ibarra')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Pedro Fernando Chavez Ibarra');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Valentina Isabel Campos Quintanilla')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Valentina Isabel Campos Quintanilla');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Elizabeth del Carmen Gomez Epilef')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Elizabeth del Carmen Gomez Epilef');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Reinaldo Ramon Martinez Velazco')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Reinaldo Ramon Martinez Velazco');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Carlos Enrique Quidel Osorio')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Carlos Enrique Quidel Osorio');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Soporte de Instalacion')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Soporte de Instalacion');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Cristian Roberto Canales Munoz')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Cristian Roberto Canales Munoz');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'German Horacio Soto Arancibia')
    INSERT INTO Capacitadores (Nombre) VALUES (N'German Horacio Soto Arancibia');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Administrativo / Mesa de Ayuda')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Administrativo / Mesa de Ayuda');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Cristina Valeria Gonzalez Huenullanca')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Cristina Valeria Gonzalez Huenullanca');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Nicolas Antonio Roman Torres')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Nicolas Antonio Roman Torres');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Camila Javiera Rivera Medina')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Camila Javiera Rivera Medina');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Constanza Javiera Urquieta Urzua')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Constanza Javiera Urquieta Urzua');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Gabriela Gisselle Caro Vasquez')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Gabriela Gisselle Caro Vasquez');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Asesor Tecnico de Mesa de Ayuda')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Asesor Tecnico de Mesa de Ayuda');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Ivonne del Pilar Paillalef Diaz')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Ivonne del Pilar Paillalef Diaz');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Asistente Administrativo')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Asistente Administrativo');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Roxana Aurora Baez Perez')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Roxana Aurora Baez Perez');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Maria Teresa Yanez')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Maria Teresa Yanez');

IF NOT EXISTS (SELECT 1 FROM Capacitadores WHERE Nombre = N'Claudia Andrea Salas Aravena')
    INSERT INTO Capacitadores (Nombre) VALUES (N'Claudia Andrea Salas Aravena');

IF NOT EXISTS (SELECT 1 FROM JefesProyecto WHERE Nombre = N'Sebastian Enrique Vergara Olivos')
    INSERT INTO JefesProyecto (Nombre) VALUES (N'Sebastian Enrique Vergara Olivos');

IF NOT EXISTS (SELECT 1 FROM JefesProyecto WHERE Nombre = N'German Andres Rojas Albornoz')
    INSERT INTO JefesProyecto (Nombre) VALUES (N'German Andres Rojas Albornoz');


