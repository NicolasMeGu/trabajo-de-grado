import { supabase } from '../lib/supabase';
import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';

const ProjectMap = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Función para obtener todas las ubicaciones de proyectos actuales
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*');
      if (error) {
        console.log('Error fetching projects: ', error);
      } else {
        setProjects(data);
      }
    };

    fetchProjects();

    // Suscribirse a los cambios en tiempo real en la tabla user_locations
    const projectSubscription = supabase
      .from('user_locations')
      .on('INSERT', payload => {
        setProjects(prevProjects => [...prevProjects, payload.new]);
      })
      .on('UPDATE', payload => {
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === payload.new.id ? payload.new : project
          )
        );
      })
      .on('DELETE', payload => {
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== payload.old.id)
        );
      })
      .subscribe();

    // Limpiar la suscripción al desmontar el componente
    return () => {
      supabase.removeSubscription(projectSubscription);
    };
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {projects.map((project) => (
        <Marker
          key={project.id}
          coordinate={{ latitude: project.latitude, longitude: project.longitude }}
          title={project.projectType}
          description={`Producto: ${project.product} - Transacción: ${project.transactionType}`}
        />
      ))}
    </MapView>
  );
};

export default ProjectMap;
